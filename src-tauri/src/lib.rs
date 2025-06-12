// lib.rs

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::{
    http::{Request as HttpRequest, Response as HttpResponse},
    AppHandle, Manager, Runtime,
};
use tauri_plugin_shell::ShellExt;
use url::Url;

// --- データ構造 (変更なし) ---

#[derive(Debug, Serialize)]
struct VideoInfo {
    title: String,
    duration: String,
    formats: Vec<VideoFormat>,
}

#[derive(Debug, Serialize)]
struct VideoFormat {
    format_id: String,
    ext: String,
    quality: String,
}

// --- Tauriコマンド (get_proxy_url は削除) ---

#[tauri::command]
async fn get_video_info(
    app_handle: AppHandle,
    video_url: String,
) -> Result<VideoInfo, String> {
    let shell = app_handle.shell();
    let output = shell
        .sidecar("ytdlp-sidecar")
        .unwrap()
        .args(["--dump-json", "--no-download", &video_url])
        .output()
        .await
        .map_err(|e| format!("Failed to execute yt-dlp: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "yt-dlp error: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let json_str = String::from_utf8_lossy(&output.stdout);
    let json_value: serde_json::Value =
        serde_json::from_str(&json_str).map_err(|e| format!("Failed to parse JSON: {}", e))?;

    let title = json_value["title"].as_str().unwrap_or("Unknown").to_string();
    let duration = json_value["duration"].as_u64().unwrap_or(0);
    let duration_str = format!("{}:{:02}", duration / 60, duration % 60);

    let mut formats = Vec::new();
    if let Some(formats_array) = json_value["formats"].as_array() {
        for format in formats_array {
            if let (Some(format_id), Some(ext)) =
                (format["format_id"].as_str(), format["ext"].as_str())
            {
                if ext == "mp4" || ext == "webm" {
                    let quality = format["height"]
                        .as_u64()
                        .map(|h| format!("{}p", h))
                        .unwrap_or_else(|| "Unknown".to_string());
                    formats.push(VideoFormat {
                        format_id: format_id.to_string(),
                        ext: ext.to_string(),
                        quality,
                    });
                }
            }
        }
    }

    Ok(VideoInfo {
        title,
        duration: duration_str,
        formats,
    })
}

#[tauri::command]
async fn download_video(
    app_handle: AppHandle,
    video_url: String,
    output_path: String,
    format_id: Option<String>,
) -> Result<String, String> {
    let shell = app_handle.shell();
    let mut args = vec!["--output", &output_path];
    if let Some(ref format) = format_id {
        args.push("--format");
        args.push(format);
    } else {
        args.push("--format");
        args.push("best[ext=mp4]/best");
    }
    args.push(&video_url);

    let output = shell
        .sidecar("ytdlp-sidecar")
        .unwrap()
        .args(args)
        .output()
        .await
        .map_err(|e| format!("Failed to execute yt-dlp: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "yt-dlp error: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    Ok("Download completed successfully".to_string())
}

// --- カスタムプロトコルの実装 ---

/// yt-dlpを使って実際のストリームURLを取得するヘルパー関数
async fn get_real_stream_url<R: Runtime>(
    app_handle: &AppHandle<R>,
    video_url: String,
    format_id: Option<String>,
) -> Result<String, String> {
    let shell = app_handle.shell();
    let mut args = vec!["--get-url"];
    if let Some(format) = format_id.as_ref() {
        args.push("--format");
        args.push(format);
    } else {
        args.push("--format");
        args.push("best[ext=mp4]/best");
    }
    args.push(&video_url);

    let output = shell
        .sidecar("ytdlp-sidecar")
        .unwrap()
        .args(args)
        .output()
        .await
        .map_err(|e| format!("Failed to execute yt-dlp: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "yt-dlp error: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }
    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

/// "stream"カスタムプロトコルのための非同期ハンドラ
async fn stream_protocol_handler<R: Runtime>(
    app_handle: AppHandle<R>,
    request: HttpRequest<Vec<u8>>,
) -> Result<HttpResponse<Vec<u8>>, Box<dyn std::error::Error>> {
    // 1. リクエストURLから video_url と format_id をパース
    let parsed_url = Url::parse(&request.uri().to_string())?;
    let queries: HashMap<_, _> = parsed_url.query_pairs().into_owned().collect();
    let video_url = queries
        .get("video_url")
        .cloned()
        .ok_or("Query parameter 'video_url' not found")?;
    let format_id = queries.get("format_id").cloned();

    // 2. yt-dlpで実際のストリームURLを取得
    let real_url = match get_real_stream_url(&app_handle, video_url, format_id).await {
        Ok(url) => url,
        Err(e) => {
            eprintln!("Error getting stream URL: {}", e);
            let response = HttpResponse::builder().status(500).body(e.into_bytes())?;
            return Ok(response);
        }
    };

    // 3. 実際のストリームURLにリクエストを送信
    let client = reqwest::Client::new();
    let mut request_builder = client.get(&real_url);

    // シーク（再生位置指定）のために "Range" ヘッダーを転送
    if let Some(range) = request.headers().get("range") {
        request_builder = request_builder.header("Range", range.to_str()?);
    }

    let upstream_res = match request_builder.send().await {
        Ok(res) => res,
        Err(e) => {
            eprintln!("Upstream request failed: {}", e);
            let response = HttpResponse::builder()
                .status(502) // Bad Gateway
                .body(e.to_string().into_bytes())?;
            return Ok(response);
        }
    };

    // 4. Webビューに返すレスポンスを構築
    let status = upstream_res.status().as_u16();
    let headers = upstream_res.headers().clone();
    let body = upstream_res.bytes().await?.to_vec();

    let mut response_builder = HttpResponse::builder().status(status);
    for (name, value) in headers.iter() {
        // "connection"ヘッダーは転送してはならない
        if name.as_str().to_lowercase() != "connection" {
            response_builder = response_builder.header(name.as_str(), value.as_bytes());
        }
    }
    response_builder = response_builder.header("Access-Control-Allow-Origin", "*");

    Ok(response_builder.body(body)?)
}

// --- アプリケーションのセットアップ ---

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_video_info,
            download_video
            // get_proxy_url は削除
        ])
        // Tauri 2.0のカスタムプロトコルを登録
        .register_uri_scheme_protocol("stream", move |context, request| {
            let app_handle = context.app_handle().clone();
            let request_clone = request;
            
            // 非同期処理をブロッキングで実行
            tauri::async_runtime::block_on(async move {
                match stream_protocol_handler(app_handle, request_clone).await {
                    Ok(response) => response,
                    Err(e) => {
                        eprintln!("Error in stream protocol handler: {}", e);
                        HttpResponse::builder()
                            .status(500)
                            .body(e.to_string().into_bytes())
                            .unwrap()
                    }
                }
            })
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
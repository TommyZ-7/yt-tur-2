use axum::{
    body::Body,
    extract::{Query, State},
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use futures::stream::StreamExt;
use http::{HeaderMap, StatusCode};
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use tauri::{App, AppHandle, Manager};
use tauri_plugin_shell::ShellExt;

// --- Static Proxy Server Port ---
// アプリケーション起動時に利用可能なポートを自動で選択します。
static PROXY_PORT: Lazy<u16> =
    Lazy::new(|| portpicker::pick_unused_port().expect("Failed to find a free port"));

// --- Data Structures ---
// フロントエンドとバックエンドでやり取りするデータの型定義

#[derive(Debug, Serialize)]
struct VideoInfo {
    title: String,
    duration: String,
    // video_url is removed from the top level as it's passed per request
    formats: Vec<VideoFormat>,
}

#[derive(Debug, Serialize)]
struct VideoFormat {
    format_id: String,
    ext: String,
    quality: String,
    // Direct URL is removed to prevent CORS issues on the frontend.
    // The frontend will use the format_id to request a proxy stream.
}

#[derive(Debug, Deserialize)]
struct StreamRequest {
    video_url: String,
    format_id: Option<String>,
}

// --- Tauri Commands ---
// フロントエンドから呼び出されるRust関数

#[tauri::command]
async fn get_video_info(
    app_handle: AppHandle,
    video_url: String,
) -> Result<VideoInfo, String> {
    let shell = app_handle.shell();

    // yt-dlpで動画情報をJSON形式で取得
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

    // フォーマット情報を抽出
    let mut formats = Vec::new();
    if let Some(formats_array) = json_value["formats"].as_array() {
        for format in formats_array {
            if let (Some(format_id), Some(ext)) =
                (format["format_id"].as_str(), format["ext"].as_str())
            {
                // 再生可能なコンテナフォーマットに絞る
                if ext == "mp4" || ext == "webm" {
                    let quality = format["height"]
                        .as_u64()
                        .map(|h| format!("{}p", h))
                        .unwrap_or_else(|| "Unknown".to_string());

                    formats.push(VideoFormat {
                        format_id: format_id.to_string(),
                        ext: ext.to_string(),
                        quality,
                        // url field is removed
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

/// フロントエンドにプロキシURLを返すコマンド
#[tauri::command]
fn get_proxy_url(video_url: String, format_id: Option<String>) -> String {
    let encoded_video_url = urlencoding::encode(&video_url);

    let mut url = format!(
        "http://localhost:{}/stream?video_url={}",
        *PROXY_PORT, encoded_video_url
    );

    if let Some(fid) = format_id {
        let encoded_format_id = urlencoding::encode(&fid);
        url.push_str(&format!("&format_id={}", encoded_format_id));
    }

    url
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


// --- Proxy Server Implementation ---

/// yt-dlpを使って実際のストリームURLを取得するヘルパー関数
async fn get_real_stream_url(
    app_handle: &AppHandle,
    video_url: String,
    format_id: Option<String>,
) -> Result<String, String> {
    let shell = app_handle.shell();

    let mut args = vec!["--get-url"];

    if let Some(format) = format_id.as_ref() {
        args.push("--format");
        args.push(format);
    } else {
        // デフォルトのフォーマット
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

/// Axumのハンドラ: ストリームリクエストをプロキシする
async fn stream_handler(
    State(app_handle): State<AppHandle>,
    Query(params): Query<StreamRequest>,
    headers: HeaderMap,
) -> Result<Response, (StatusCode, String)> {
    // 1. yt-dlpで実際のストリームURLを取得
    let real_url = match get_real_stream_url(&app_handle, params.video_url, params.format_id).await {
        Ok(url) => url,
        Err(e) => {
            eprintln!("Error getting stream URL: {}", e);
            return Err((StatusCode::INTERNAL_SERVER_ERROR, e));
        }
    };

    // 2. reqwestで外部の動画サーバーにリクエスト
    let client = reqwest::Client::new();
    let mut request_builder = client.get(&real_url);

    // フロントエンドからのRangeヘッダー（シーク用）を転送
    if let Some(range) = headers.get(http::header::RANGE) {
        request_builder = request_builder.header(
            reqwest::header::RANGE,
            range.to_str().unwrap_or("").to_string(),
        );
    }

    let upstream_res = match request_builder.send().await {
        Ok(res) => res,
        Err(e) => {
            eprintln!("Upstream request failed: {}", e);
            return Err((StatusCode::BAD_GATEWAY, format!("Upstream error: {}", e)));
        }
    };

    // 3. 外部サーバーからのレスポンスをフロントエンドに中継
    let mut response_builder = Response::builder().status(
        http::StatusCode::from_u16(upstream_res.status().as_u16()).unwrap_or(http::StatusCode::INTERNAL_SERVER_ERROR)
    );

    // ヘッダーをコピー (Content-Type, Content-Length, Accept-Rangesなど)
    if let Some(headers) = response_builder.headers_mut() {
        for (key, value) in upstream_res.headers().iter() {
            headers.insert(
                http::header::HeaderName::from_bytes(key.as_str().as_bytes()).unwrap(),
                http::header::HeaderValue::from_bytes(value.as_bytes()).unwrap(),
            );
        }
    }
    
    // レスポンスボディをストリームとして設定
    let body = Body::from_stream(upstream_res.bytes_stream());

    response_builder
        .body(body)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
}

// --- Application Setup ---

fn setup_app(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let app_handle = app.handle().clone();
    let port = *PROXY_PORT;

    // 非同期ランタイムでAxumサーバーを起動
    tauri::async_runtime::spawn(async move {
        let app_router = Router::new()
            .route("/stream", get(stream_handler))
            .with_state(app_handle);

        let addr = SocketAddr::from(([127, 0, 0, 1], port));
        println!("Proxy server listening on http://{}", addr);

        let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
        axum::serve(listener, app_router.into_make_service())
            .await
            .unwrap();
    });

    Ok(())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(setup_app)
        .invoke_handler(tauri::generate_handler![
            get_video_info,
            get_proxy_url, // Changed from get_stream_url
            download_video
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
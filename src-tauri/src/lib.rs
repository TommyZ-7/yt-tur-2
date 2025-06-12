// src-tauri/src/main.rs
use tauri::{App, AppHandle, Manager};
use tauri_plugin_shell::{ShellExt, process::CommandChild};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tokio::sync::mpsc;

#[derive(Debug, Serialize, Deserialize)]
struct VideoInfo {
    title: String,
    duration: String,
    url: String,
    formats: Vec<VideoFormat>,
}

#[derive(Debug, Serialize, Deserialize)]
struct VideoFormat {
    format_id: String,
    ext: String,
    quality: String,
    url: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct StreamRequest {
    video_url: String,
    format_id: Option<String>,
}

// グローバルな状態管理
struct AppState {
    active_streams: Mutex<HashMap<String, CommandChild>>,
}

#[tauri::command]
async fn get_video_info(
    app_handle: AppHandle,
    video_url: String,
) -> Result<VideoInfo, String> {
    let shell = app_handle.shell();
    
    // yt-dlpで動画情報を取得
    let output = shell
        .sidecar("ytdlp-sidecar")
        .unwrap()
        .args([
            "--dump-json",
            "--no-download",
            &video_url,
        ])
        .output()
        .await
        .map_err(|e| format!("Failed to execute yt-dlp: {}", e))?;

    if !output.status.success() {
        return Err(format!("yt-dlp error: {}", String::from_utf8_lossy(&output.stderr)));
    }

    let json_str = String::from_utf8_lossy(&output.stdout);
    let json_value: serde_json::Value = serde_json::from_str(&json_str)
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;

    // 必要な情報を抽出
    let title = json_value["title"].as_str().unwrap_or("Unknown").to_string();
    let duration = json_value["duration"].as_u64().unwrap_or(0);
    let duration_str = format!("{}:{:02}", duration / 60, duration % 60);

    // フォーマット情報を抽出
    let mut formats = Vec::new();
    if let Some(formats_array) = json_value["formats"].as_array() {
        for format in formats_array {
            if let (Some(format_id), Some(ext), Some(url)) = (
                format["format_id"].as_str(),
                format["ext"].as_str(),
                format["url"].as_str(),
            ) {
                // 動画フォーマットのみを対象とする
                if ext == "mp4" || ext == "webm" {
                    let quality = format["height"].as_u64()
                        .map(|h| format!("{}p", h))
                        .unwrap_or_else(|| "Unknown".to_string());
                    
                    formats.push(VideoFormat {
                        format_id: format_id.to_string(),
                        ext: ext.to_string(),
                        quality,
                        url: url.to_string(),
                    });
                }
            }
        }
    }

    Ok(VideoInfo {
        title,
        duration: duration_str,
        url: video_url,
        formats,
    })
}

#[tauri::command]
async fn get_stream_url(
    app_handle: AppHandle,
    video_url: String,
    format_id: Option<String>,
) -> Result<String, String> {
    let shell = app_handle.shell();
    
    let mut args = vec!["--get-url", "--no-download"];
    
    if let Some(format) = &format_id {
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
        return Err(format!("yt-dlp error: {}", String::from_utf8_lossy(&output.stderr)));
    }

    let stream_url = String::from_utf8_lossy(&output.stdout).trim().to_string();
    Ok(stream_url)
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
    
    if let Some(format) = &format_id {
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
        return Err(format!("yt-dlp error: {}", String::from_utf8_lossy(&output.stderr)));
    }

    Ok("Download completed successfully".to_string())
}

fn setup_app(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    // アプリケーション状態を初期化
    app.manage(AppState {
        active_streams: Mutex::new(HashMap::new()),
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
            get_stream_url,
            download_video
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
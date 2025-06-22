
use serde::{ Serialize};
use tauri::{ AppHandle};
use tauri_plugin_shell::ShellExt;


mod dlp; // Import the module for channel information

use dlp::get_channel::dlp_get_channel_info;
use dlp::get_channel::dlp_get_channel_newvideo;
use dlp::get_channel::dlp_get_video_info;
use dlp::get_channel::dlp_get_channel_morevideo;
use dlp::get_channel::dlp_get_stream_url;

use dlp::dlp_manager::check_and_update;




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
        .arg("--cookies-from-browser")
        .arg("firefox")
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
        .arg("--cookies-from-browser")
        .arg("firefox")
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





#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_video_info,
            download_video,
            dlp_get_channel_info,
            dlp_get_channel_newvideo,
            dlp_get_video_info,
            dlp_get_channel_morevideo,
            dlp_get_stream_url,
            check_and_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
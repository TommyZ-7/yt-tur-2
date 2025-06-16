

use tauri_plugin_shell::ShellExt;
use serde_json::{Value, json};
use serde::{Deserialize, Serialize};
use encoding_rs::SHIFT_JIS;
use std::str;

#[derive(Deserialize, Debug)]
struct VideoInfo {
    // 動画ID
    id: String,
    // 動画タイトル
    title: String,
    // サムネイル画像のURL
    thumbnail: String,
    // 再生回数
    view_count: u64,
    // アップロード日 (YYYYMMDD形式の文字列)
    upload_date: String,
}




#[tauri::command]
pub async fn dlp_get_channel_info(app_handle: tauri::AppHandle, channel_url: String) -> Result<String, String> {
    let shell = app_handle.shell();

    println!("Fetching channel info for URL: {}", channel_url);

    // yt-dlpでチャンネル情報をJSON形式で取得
    let output = shell
        .sidecar("ytdlp-sidecar")
        .unwrap()
        .arg("-J")
        .arg("--playlist-items")
        .arg("1")
        .arg(&channel_url)
        .output()
        .await
        .map_err(|e| format!("Failed to execute yt-dlp: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "yt-dlp error: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }
    

    let json = String::from_utf8_lossy(&output.stdout);
    
    // jsonからentriesを抽出
    let json_value: Value = serde_json::from_str(&json).map_err(|e| format!("Failed to parse JSON: {}", e))?;
    let entries = json_value.get("entries").and_then(|e| e.as_array()).ok_or("No entries found")?;

    let channel_id = json_value.get("id").and_then(|id| id.as_str()).ok_or("No channel ID found")?;
    println!("Channel ID: {}", channel_id);
    let channel_name = json_value.get("channel").and_then(|title| title.as_str()).ok_or("No channel name found")?;
    println!("Channel Name: {}", channel_name);
    let channel_id = json_value.get("channel_id").and_then(|id| id.as_str()).ok_or("No channel ID found")?;
    println!("Channel ID: {}", channel_id);
    let channel_followers = json_value.get("channel_follower_count").and_then(|f| f.as_u64()).unwrap_or(0);
    println!("Channel Followers: {}", channel_followers);
    let channel_description = json_value.get("description").and_then(|desc| desc.as_str()).unwrap_or("No description available");
    println!("Channel Description: {}", channel_description);

    // サムネイルはさらに配列から取得する必要がある
    // ここでは最初のサムネイルを取得する例を示す
    let thumbnail = json_value.get("thumbnails")
        .and_then(|thumbnails| thumbnails.as_array())
        .and_then(|arr| arr.first())
        .and_then(|thumb| thumb.get("url"))
        .and_then(|url| url.as_str())
        .unwrap_or("No thumbnail available");
    println!("Channel Thumbnail: {}", thumbnail);

    let thumbnail_last = json_value.get("thumbnails")
        .and_then(|thumbnails| thumbnails.as_array())
        .and_then(|arr| arr.last())
        .and_then(|thumb| thumb.get("url"))
        .and_then(|url| url.as_str())
        .unwrap_or("No thumbnail available");
    println!("Channel Thumbnail (Last): {}", thumbnail_last);

    // チャンネル情報をJSON形式で返す
    let channel_info = json!({
        "channel_id": channel_id,
        "channel_name": channel_name,
        "channel_followers": channel_followers,
        "channel_description": channel_description,
        "thumbnail": thumbnail,
        "thumbnail_last": thumbnail_last
    });

    Ok(serde_json::to_string(&channel_info).map_err(|e| format!("Failed to serialize channel info: {}", e))?)   
}


#[derive(Debug, Serialize)]
struct Record {
    youtube_url: String,
    title: String,
    video_id: String,
    date: String,
    view_count: String,
    thumbnail_url: String,
}



#[tauri::command]
pub async fn dlp_get_channel_newvideo(app_handle: tauri::AppHandle, channel_url: String) -> Result<String, String> {
        let shell = app_handle.shell();

    println!("Fetching channel info for URL: {}", channel_url);

    // yt-dlpでチャンネル情報をJSON形式で取得
    let output = shell
        .sidecar("ytdlp-sidecar")
        .unwrap()
        .arg("--no-warnings")
        .arg("--playlist-items")
        .arg("1-3")
        .arg("--print")
        .arg("%(webpage_url)s")
        .arg("--print")
        .arg("%(title)s")
        .arg("--print")
        .arg("%(id)s")
        .arg("--print")
        .arg("%(upload_date)s")
        .arg("--print")
        .arg("%(view_count)s")
        .arg("--print")
        .arg("%(thumbnail)s")
        .arg(&channel_url)
        .output()
        .await
        .map_err(|e| format!("Failed to execute yt-dlp: {}", e))?;

     // レコードは2つの改行コード `[10, 10]` で区切られているため、それで分割する
    let records_bytes = output.stdout.split(|w| *w == 10).filter(|s| !s.is_empty());

    // 6つのフィールドで1レコードとしてグループ化する
    let mut chunked_records = Vec::new();
    let mut current_chunk = Vec::new();
    for item in records_bytes {
        current_chunk.push(item);
        if current_chunk.len() == 6 {
            chunked_records.push(current_chunk.clone());
            current_chunk.clear();
        }
    }

    let mut video_infos: Vec<Record> = Vec::new();

    for record in chunked_records {
        // 2番目の要素がShift_JISエンコードされたタイトル
        let (title_cow, _encoding_used, _had_errors) = SHIFT_JIS.decode(record[1]);
        
        let info = Record {
            youtube_url:   str::from_utf8(record[0]).unwrap_or_default().to_string(),
            title:         title_cow.into_owned(), // デコードしたタイトル
            video_id:      str::from_utf8(record[2]).unwrap_or_default().to_string(),
            date:          str::from_utf8(record[3]).unwrap_or_default().to_string(),
            view_count:   str::from_utf8(record[4]).unwrap_or_default().to_string(),
            thumbnail_url: str::from_utf8(record[5]).unwrap_or_default().to_string(),
        };
        video_infos.push(info);
    }
    
    // 結果をきれいに表示
    for (i, info) in video_infos.iter().enumerate() {
        println!("--- 動画 {} ---", i + 1);
        println!("{:#?}\n", info);
    }


    
    Ok(serde_json::to_string(&video_infos)
        .map_err(|e| format!("Failed to serialize video info: {}", e))?)
       
}

#[tauri::command]
pub async fn dlp_get_channel_morevideo(app_handle: tauri::AppHandle, channel_url: String, offset: u32) -> Result<String, String> {
        let shell = app_handle.shell();

    println!("Fetching channel info for URL: {}", channel_url);

    // yt-dlpでチャンネル情報をJSON形式で取得
    let output = shell
        .sidecar("ytdlp-sidecar")
        .unwrap()
        .arg("--no-warnings")
        .arg("--playlist-items")
        .arg(format!("{}-{}", offset + 1, offset + 6)) // オフセットを考慮して取得
        .arg("--print")
        .arg("%(webpage_url)s")
        .arg("--print")
        .arg("%(title)s")
        .arg("--print")
        .arg("%(id)s")
        .arg("--print")
        .arg("%(upload_date)s")
        .arg("--print")
        .arg("%(view_count)s")
        .arg("--print")
        .arg("%(thumbnail)s")
        .arg(&channel_url)
        .output()
        .await
        .map_err(|e| format!("Failed to execute yt-dlp: {}", e))?;

     // レコードは2つの改行コード `[10, 10]` で区切られているため、それで分割する
    let records_bytes = output.stdout.split(|w| *w == 10).filter(|s| !s.is_empty());

    // 6つのフィールドで1レコードとしてグループ化する
    let mut chunked_records = Vec::new();
    let mut current_chunk = Vec::new();
    for item in records_bytes {
        current_chunk.push(item);
        if current_chunk.len() == 6 {
            chunked_records.push(current_chunk.clone());
            current_chunk.clear();
        }
    }

    let mut video_infos: Vec<Record> = Vec::new();

    for record in chunked_records {
        // 2番目の要素がShift_JISエンコードされたタイトル
        let (title_cow, _encoding_used, _had_errors) = SHIFT_JIS.decode(record[1]);
        
        let info = Record {
            youtube_url:   str::from_utf8(record[0]).unwrap_or_default().to_string(),
            title:         title_cow.into_owned(), // デコードしたタイトル
            video_id:      str::from_utf8(record[2]).unwrap_or_default().to_string(),
            date:          str::from_utf8(record[3]).unwrap_or_default().to_string(),
            view_count:   str::from_utf8(record[4]).unwrap_or_default().to_string(),
            thumbnail_url: str::from_utf8(record[5]).unwrap_or_default().to_string(),
        };
        video_infos.push(info);
    }
    
    // 結果をきれいに表示
    for (i, info) in video_infos.iter().enumerate() {
        println!("--- 動画 {} ---", i + 1);
        println!("{:#?}\n", info);
    }


    
    Ok(serde_json::to_string(&video_infos)
        .map_err(|e| format!("Failed to serialize video info: {}", e))?)
       
}


#[tauri::command]
pub async fn dlp_get_video_info(app_handle: tauri::AppHandle, video_url: String) -> Result<String, String> {
    let shell = app_handle.shell();

    println!("Fetching video info for URL: {}", video_url);

    // yt-dlpで動画情報をJSON形式で取得
    let output = shell
        .sidecar("ytdlp-sidecar")
        .unwrap()
        .arg("-J")
        .arg(&video_url)
        .output()
        .await
        .map_err(|e| format!("Failed to execute yt-dlp: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "yt-dlp error: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let video_info: VideoInfo = serde_json::from_slice(&output.stdout)
        .map_err(|e| format!("Failed to parse video info JSON: {}", e))?;


    println!("Video ID: {}", video_info.id);
    println!("Video Title: {}", video_info.title);
    println!("Thumbnail URL: {}", video_info.thumbnail);
    println!("View Count: {}", video_info.view_count);
    println!("Upload Date: {}", video_info.upload_date);
    // 動画情報をJSON形式で返す
    let video_info_json = json!({
        "id": video_info.id,
        "title": video_info.title,
        "thumbnail": video_info.thumbnail,
        "view_count": video_info.view_count,
        "upload_date": video_info.upload_date
    });
    Ok(serde_json::to_string(&video_info_json)
        .map_err(|e| format!("Failed to serialize video info: {}", e))?)
}
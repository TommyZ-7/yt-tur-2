use serde::{Deserialize, Serialize};
use tauri::command;
use reqwest;
use std::collections::HashMap;

// レスポンス用の構造体定義
#[derive(Debug, Serialize, Deserialize)]
pub struct ChannelInfo {
    pub name: String,
    pub icon_url: String,
    pub banner_url: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoInfo {
    pub title: String,
    pub video_id: String,
    pub published: i64,
    pub view_count: i64,
    pub length_seconds: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DetailedVideoInfo {
    pub channel_name: String,
    pub title: String,
    pub view_count: i64,
    pub like_count: i64,
    pub formats: Vec<VideoFormat>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoFormat {
    pub itag: i32,
    pub url: String,
    pub mime_type: String,
    pub quality: String,
    pub fps: Option<i32>,
    pub bitrate: Option<i32>,
}

// Invidious APIのレスポンス構造体
#[derive(Debug, Deserialize)]
struct InvidiousChannel {
    author: String,
    #[serde(rename = "authorThumbnails")]
    author_thumbnails: Vec<InvidiousThumbnail>,
    #[serde(rename = "authorBanners")]
    author_banners: Option<Vec<InvidiousBanner>>,
    description: String,
}

#[derive(Debug, Deserialize)]
struct InvidiousThumbnail {
    url: String,
    width: i32,
    height: i32,
}

#[derive(Debug, Deserialize)]
struct InvidiousBanner {
    url: String,
    width: i32,
    height: i32,
}

#[derive(Debug, Deserialize)]
struct InvidiousVideo {
    title: String,
    #[serde(rename = "videoId")]
    video_id: String,
    published: i64,
    #[serde(rename = "viewCount")]
    view_count: i64,
    #[serde(rename = "lengthSeconds")]
    length_seconds: i32,
}

#[derive(Debug, Deserialize)]
struct InvidiousVideoDetail {
    title: String,
    author: String,
    #[serde(rename = "viewCount")]
    view_count: i64,
    #[serde(rename = "likeCount")]
    like_count: i64,
    #[serde(rename = "formatStreams")]
    format_streams: Vec<InvidiousFormat>,
    #[serde(rename = "adaptiveFormats")]
    adaptive_formats: Vec<InvidiousFormat>,
}

#[derive(Debug, Deserialize)]
struct InvidiousFormat {
    itag: i32,
    url: String,
    #[serde(rename = "type")]
    mime_type: String,
    quality: Option<String>,
    fps: Option<i32>,
    bitrate: Option<i32>,
}

// ユーティリティ関数
fn extract_channel_id_from_url(url: &str) -> Result<String, String> {
    if let Some(captures) = regex::Regex::new(r"(?:youtube\.com/(?:c/|channel/|user/|@)?|youtu\.be/)([a-zA-Z0-9_-]+)")
        .unwrap()
        .captures(url) {
        Ok(captures[1].to_string())
    } else {
        Err("Invalid channel URL".to_string())
    }
}

fn extract_video_id_from_url(url: &str) -> Result<String, String> {
    if let Some(captures) = regex::Regex::new(r"(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]+)")
        .unwrap()
        .captures(url) {
        Ok(captures[1].to_string())
    } else {
        Err("Invalid video URL".to_string())
    }
}

// Tauri コマンド関数

#[tauri::command]
pub async fn inv_get_channel_info(channel_url: String, api_url: String) -> Result<ChannelInfo, String> {
    let instance = api_url;
    let channel_id = extract_channel_id_from_url(&channel_url)?;
    
    let client = reqwest::Client::new();
    let url = format!("{}/api/v1/channels/{}", instance, channel_id);
    println!("Fetching channel info from URL: {}", url);
    
    let response = client.get(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    
    if !response.status().is_success() {
        return Err(format!("API request failed with status: {}", response.status()));
    }
    
    let channel: InvidiousChannel = response.json()
        .await
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;
    
    let icon_url = channel.author_thumbnails
        .iter()
        .max_by_key(|t| t.width * t.height)
        .map(|t| t.url.clone())
        .unwrap_or_default();
    
    let banner_url = channel.author_banners
        .as_ref()
        .and_then(|banners| banners.iter().max_by_key(|b| b.width * b.height))
        .map(|b| b.url.clone())
        .unwrap_or_default();
    
    Ok(ChannelInfo {
        name: channel.author,
        icon_url,
        banner_url,
        description: channel.description,
    })
}

#[tauri::command]
pub async fn inv_get_new_video(channel_url: String, api_url: String) -> Result<Vec<VideoInfo>, String> {
    let instance = api_url;
    let channel_id = extract_channel_id_from_url(&channel_url)?;
    
    let client = reqwest::Client::new();
    let url = format!("{}/api/v1/channels/{}/videos", instance, channel_id);
    
    let response = client.get(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("API request failed with status: {}", response.status()));
    }
    
    let videos: Vec<InvidiousVideo> = response.json()
        .await
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;
    
    let result = videos.into_iter()
        .take(3)
        .map(|v| VideoInfo {
            title: v.title,
            video_id: v.video_id,
            published: v.published,
            view_count: v.view_count,
            length_seconds: v.length_seconds,
        })
        .collect();
    
    Ok(result)
}

#[tauri::command]
pub async fn inv_get_video(
    channel_url: String, 
    start: usize, 
    end: usize, 
    api_url: String
) -> Result<Vec<VideoInfo>, String> {
    let instance = api_url;
    let channel_id = extract_channel_id_from_url(&channel_url)?;
    
    if start >= end {
        return Err("Start index must be less than end index".to_string());
    }
    
    let client = reqwest::Client::new();
    let url = format!("{}/api/v1/channels/{}/videos", instance, channel_id);
    
    let response = client.get(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("API request failed with status: {}", response.status()));
    }
    
    let videos: Vec<InvidiousVideo> = response.json()
        .await
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;
    
    let result = videos.into_iter()
        .skip(start)
        .take(end - start)
        .map(|v| VideoInfo {
            title: v.title,
            video_id: v.video_id,
            published: v.published,
            view_count: v.view_count,
            length_seconds: v.length_seconds,
        })
        .collect();
    
    Ok(result)
}

#[tauri::command]
pub async fn inv_get_video_info(video_url: String, api_url: String) -> Result<DetailedVideoInfo, String> {
    let instance = api_url;
    let video_id = extract_video_id_from_url(&video_url)?;
    
    let client = reqwest::Client::new();
    let url = format!("{}/api/v1/videos/{}", instance, video_id);
    
    let response = client.get(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("API request failed with status: {}", response.status()));
    }
    
    let video: InvidiousVideoDetail = response.json()
        .await
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;
    
    let mut formats = Vec::new();
    
    // formatStreams（通常の動画+音声）を追加
    for format in video.format_streams {
        formats.push(VideoFormat {
            itag: format.itag,
            url: format.url,
            mime_type: format.mime_type,
            quality: format.quality.unwrap_or_default(),
            fps: format.fps,
            bitrate: format.bitrate,
        });
    }
    
    // adaptiveFormats（動画のみ、音声のみ）を追加
    for format in video.adaptive_formats {
        formats.push(VideoFormat {
            itag: format.itag,
            url: format.url,
            mime_type: format.mime_type,
            quality: format.quality.unwrap_or_default(),
            fps: format.fps,
            bitrate: format.bitrate,
        });
    }
    
    Ok(DetailedVideoInfo {
        channel_name: video.author,
        title: video.title,
        view_count: video.view_count,
        like_count: video.like_count,
        formats,
    })
}

#[tauri::command]
pub async fn inv_get_video_url(
    video_url: String, 
    format_id: i32, 
    api_url: String
) -> Result<String, String> {
    let video_info = inv_get_video_info(video_url, api_url).await?;
    
    for format in video_info.formats {
        if format.itag == format_id {
            return Ok(format.url);
        }
    }
    
    Err(format!("Format with ID {} not found", format_id))
}
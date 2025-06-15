use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::State;
use tokio::sync::Mutex;

// データ構造体の定義
#[derive(Debug, Serialize, Deserialize)]
pub struct ChannelInfo {
    pub channel_name: String,
    pub channel_icon_url: String,
    pub channel_banner_url: String,
    pub channel_description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoInfo {
    pub video_id: String,
    pub title: String,
    pub published_at: String,
    pub thumbnail_url: String,
    pub duration: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DetailedVideoInfo {
    pub channel_name: String,
    pub video_title: String,
    pub view_count: String,
    pub like_count: String,
    pub formats: Vec<VideoFormat>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoFormat {
    pub format_id: String,
    pub format_note: String,
    pub ext: String,
    pub quality: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StreamUrl {
    pub url: String,
    pub expires_at: String,
}

// YouTube Data API レスポンス構造体
#[derive(Debug, Deserialize)]
struct YouTubeChannelResponse {
    items: Vec<YouTubeChannel>,
}

#[derive(Debug, Deserialize)]
struct YouTubeChannel {
    id: String,
    snippet: ChannelSnippet,
    #[serde(rename = "brandingSettings")]
    branding_settings: Option<BrandingSettings>,
}

#[derive(Debug, Deserialize)]
struct ChannelSnippet {
    title: String,
    description: String,
    thumbnails: Thumbnails,
}

#[derive(Debug, Deserialize)]
struct BrandingSettings {
    image: Option<BrandingImage>,
}

#[derive(Debug, Deserialize)]
struct BrandingImage {
    #[serde(rename = "bannerExternalUrl")]
    banner_external_url: Option<String>,
}

#[derive(Debug, Deserialize)]
struct Thumbnails {
    high: Option<Thumbnail>,
    medium: Option<Thumbnail>,
    default: Option<Thumbnail>,
}

#[derive(Debug, Deserialize)]
struct Thumbnail {
    url: String,
}

#[derive(Debug, Deserialize)]
struct YouTubeSearchResponse {
    items: Vec<YouTubeSearchItem>,
}

#[derive(Debug, Deserialize)]
struct YouTubeSearchItem {
    id: VideoId,
    snippet: VideoSnippet,
}

#[derive(Debug, Deserialize)]
struct VideoId {
    #[serde(rename = "videoId")]
    video_id: String,
}

#[derive(Debug, Deserialize)]
struct VideoSnippet {
    title: String,
    #[serde(rename = "publishedAt")]
    published_at: String,
    thumbnails: Thumbnails,
}

#[derive(Debug, Deserialize)]
struct YouTubeVideoResponse {
    items: Vec<YouTubeVideoItem>,
}

#[derive(Debug, Deserialize)]
struct YouTubeVideoItem {
    snippet: VideoDetailSnippet,
    statistics: VideoStatistics,
    #[serde(rename = "contentDetails")]
    content_details: ContentDetails,
}

#[derive(Debug, Deserialize)]
struct VideoDetailSnippet {
    title: String,
    #[serde(rename = "channelTitle")]
    channel_title: String,
}

#[derive(Debug, Deserialize)]
struct VideoStatistics {
    #[serde(rename = "viewCount")]
    view_count: Option<String>,
    #[serde(rename = "likeCount")]
    like_count: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ContentDetails {
    duration: String,
}

// URLからチャンネルIDまたは動画IDを抽出する関数
fn extract_channel_id_from_url(url: &str) -> Option<String> {
    let re = regex::Regex::new(r"(?:youtube\.com/channel/|youtube\.com/c/|youtube\.com/user/|youtube\.com/@)([^/?]+)").unwrap();
    if let Some(captures) = re.captures(url) {
        return Some(captures[1].to_string());
    }
    None
}

fn extract_video_id_from_url(url: &str) -> Option<String> {
    let re = regex::Regex::new(r"(?:youtube\.com/watch\?v=|youtu\.be/)([^&/?]+)").unwrap();
    if let Some(captures) = re.captures(url) {
        return Some(captures[1].to_string());
    }
    None
}

// チャンネル情報を取得
#[tauri::command]
pub async fn yda_get_channel_info(
    api_key: String,
    channel_url: String,
) -> Result<ChannelInfo, String> {
    
    let channel_id = extract_channel_id_from_url(&channel_url)
        .ok_or("Invalid channel URL")?;
    
    let client = reqwest::Client::new();
    let url = format!(
        "https://www.googleapis.com/youtube/v3/channels?part=snippet,brandingSettings&id={}&key={}",
        channel_id, api_key
    );
    
    let response = client.get(&url).send().await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    let channel_response: YouTubeChannelResponse = response.json().await
        .map_err(|e| format!("Failed to parse response: {}", e))?;
    
    if let Some(channel) = channel_response.items.first() {
        let icon_url = channel.snippet.thumbnails.high
            .as_ref()
            .or(channel.snippet.thumbnails.medium.as_ref())
            .or(channel.snippet.thumbnails.default.as_ref())
            .map(|t| t.url.clone())
            .unwrap_or_default();
        
        let banner_url = channel.branding_settings
            .as_ref()
            .and_then(|b| b.image.as_ref())
            .and_then(|i| i.banner_external_url.clone())
            .unwrap_or_default();
        
        Ok(ChannelInfo {
            channel_name: channel.snippet.title.clone(),
            channel_icon_url: icon_url,
            channel_banner_url: banner_url,
            channel_description: channel.snippet.description.clone(),
        })
    } else {
        Err("Channel not found".to_string())
    }
}

// 最新動画3本を取得
#[tauri::command]
pub async fn yda_get_new_video(
    api_key: String,
    channel_url: String,
) -> Result<Vec<VideoInfo>, String> {
    
    let channel_id = extract_channel_id_from_url(&channel_url)
        .ok_or("Invalid channel URL")?;
    
    let client = reqwest::Client::new();
    let url = format!(
        "https://www.googleapis.com/youtube/v3/search?part=snippet&channelId={}&maxResults=3&order=date&type=video&key={}",
        channel_id, api_key
    );
    
    let response = client.get(&url).send().await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    let search_response: YouTubeSearchResponse = response.json().await
        .map_err(|e| format!("Failed to parse response: {}", e))?;
    
    let videos: Vec<VideoInfo> = search_response.items.into_iter().map(|item| {
        let thumbnail_url = item.snippet.thumbnails.high
            .as_ref()
            .or(item.snippet.thumbnails.medium.as_ref())
            .or(item.snippet.thumbnails.default.as_ref())
            .map(|t| t.url.clone())
            .unwrap_or_default();
        
        VideoInfo {
            video_id: item.id.video_id,
            title: item.snippet.title,
            published_at: item.snippet.published_at,
            thumbnail_url,
            duration: "".to_string(), // Search APIでは取得できないため、別途取得が必要
        }
    }).collect();
    
    Ok(videos)
}

// 指定範囲の動画を取得
#[tauri::command]
pub async fn yda_get_video(
    api_key: String,
    channel_url: String,
    start: u32,
    end: u32,
) -> Result<Vec<VideoInfo>, String> {
    
    if start >= end || end - start > 50 {
        return Err("Invalid range or range too large".to_string());
    }
    
    let channel_id = extract_channel_id_from_url(&channel_url)
        .ok_or("Invalid channel URL")?;
    
    let client = reqwest::Client::new();
    let max_results = end - start;
    let url = format!(
        "https://www.googleapis.com/youtube/v3/search?part=snippet&channelId={}&maxResults={}&order=date&type=video&key={}",
        channel_id, max_results, api_key
    );
    
    let response = client.get(&url).send().await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    let search_response: YouTubeSearchResponse = response.json().await
        .map_err(|e| format!("Failed to parse response: {}", e))?;
    
    let videos: Vec<VideoInfo> = search_response.items
        .into_iter()
        .skip(start as usize)
        .map(|item| {
            let thumbnail_url = item.snippet.thumbnails.high
                .as_ref()
                .or(item.snippet.thumbnails.medium.as_ref())
                .or(item.snippet.thumbnails.default.as_ref())
                .map(|t| t.url.clone())
                .unwrap_or_default();
            
            VideoInfo {
                video_id: item.id.video_id,
                title: item.snippet.title,
                published_at: item.snippet.published_at,
                thumbnail_url,
                duration: "".to_string(),
            }
        }).collect();
    
    Ok(videos)
}

// 動画詳細情報を取得
#[tauri::command]
pub async fn yda_get_video_info(
    api_key: String,
    video_url: String,
) -> Result<DetailedVideoInfo, String> {
    
    let video_id = extract_video_id_from_url(&video_url)
        .ok_or("Invalid video URL")?;
    
    let client = reqwest::Client::new();
    let url = format!(
        "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id={}&key={}",
        video_id, api_key
    );
    
    let response = client.get(&url).send().await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    let video_response: YouTubeVideoResponse = response.json().await
        .map_err(|e| format!("Failed to parse response: {}", e))?;
    
    if let Some(video) = video_response.items.first() {
        // YouTube Data APIでは再生フォーマットは取得できないため、
        // ダミーデータを返すか、別のAPIを使用する必要があります
        let formats = vec![
            VideoFormat {
                format_id: "18".to_string(),
                format_note: "360p".to_string(),
                ext: "mp4".to_string(),
                quality: "medium".to_string(),
            },
            VideoFormat {
                format_id: "22".to_string(),
                format_note: "720p".to_string(),
                ext: "mp4".to_string(),
                quality: "hd720".to_string(),
            },
        ];
        
        Ok(DetailedVideoInfo {
            channel_name: video.snippet.channel_title.clone(),
            video_title: video.snippet.title.clone(),
            view_count: video.statistics.view_count.clone().unwrap_or("0".to_string()),
            like_count: video.statistics.like_count.clone().unwrap_or("0".to_string()),
            formats,
        })
    } else {
        Err("Video not found".to_string())
    }
}

// ストリームURLを取得（YouTube Data APIでは直接取得不可）
#[tauri::command]
pub async fn yda_get_video_url(
    api_key: String,
    video_url: String,
    format_id: String,
) -> Result<StreamUrl, String> {
    // YouTube Data APIではストリーミングURLは取得できません
    // youtube-dlやyt-dlpなどの外部ツールを使用するか、
    // 別のアプローチが必要です
    Err("Stream URL extraction not available with YouTube Data API. Consider using youtube-dl or yt-dlp.".to_string())
}
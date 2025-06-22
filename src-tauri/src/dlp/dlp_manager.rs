use tauri::{AppHandle, Manager, Emitter};
use std::path::{Path, PathBuf};
use serde::Deserialize;
use anyhow::{Result, Context};
use sha2::{Sha256, Digest};
use std::io::Write;

// --- 定数定義 ---
const YTDLP_REPO: &str = "yt-dlp/yt-dlp";

#[cfg(target_os = "windows")]
const YTDLP_EXECUTABLE_NAME: &str = "yt-dlp.exe";
#[cfg(not(target_os = "windows"))]
const YTDLP_EXECUTABLE_NAME: &str = "yt-dlp";

const VERSION_FILE_NAME: &str = ".ytdlp-version";

// --- GitHub API レスポンス用構造体 ---
#[derive(Deserialize, Debug, Clone)]
pub struct GitHubAsset {
    name: String,
    browser_download_url: String,
}

#[derive(Deserialize, Debug)]
pub struct GitHubRelease {
    tag_name: String,
    assets: Vec<GitHubAsset>,
}

#[derive(Deserialize, Debug, Clone, serde::Serialize)]
struct EmitterData {
    status: String,
    progress: u32,
}


// --- プライベートヘルパー関数 ---

/// yt-dlpの実行ファイルパスを取得
fn get_executable_path(app_handle: &AppHandle) -> Result<PathBuf> {
    let app_data_dir = app_handle.path().app_data_dir().context("アプリデータディレクトリの取得に失敗")?;
    Ok(app_data_dir.join(YTDLP_EXECUTABLE_NAME))
}

/// ローカルに保存されているバージョン情報を取得
fn get_local_version(app_handle: &AppHandle) -> Result<String> {
    let version_file_path = app_handle.path().app_data_dir().context("アプリデータディレクトリの取得に失敗")?.join(VERSION_FILE_NAME);
    if version_file_path.exists() {
        Ok(std::fs::read_to_string(version_file_path)?)
    } else {
        Ok("0.0.0".to_string())
    }
}

/// 最新リリース情報をGitHub APIから取得
async fn get_latest_release(http_client: &reqwest::Client) -> Result<GitHubRelease> {
    let url = format!("https://api.github.com/repos/{}/releases/latest", YTDLP_REPO);
    let release = http_client.get(&url)
        .header("User-Agent", "Tauri-YTDLP-App")
        .send()
        .await?
        .json::<GitHubRelease>()
        .await?;
    Ok(release)
}

/// ファイルをダウンロードする
async fn download_file(http_client: &reqwest::Client, url: &str, path: &Path) -> Result<()> {
    let response = http_client.get(url).send().await?.bytes().await?;
    let mut file = std::fs::File::create(path)?;
    file.write_all(&response)?;
    Ok(())
}

/// ファイルのSHA256ハッシュを計算する
fn calculate_sha256(path: &Path) -> Result<String> {
    let mut file = std::fs::File::open(path)?;
    let mut hasher = Sha256::new();
    std::io::copy(&mut file, &mut hasher)?;
    let hash_bytes = hasher.finalize();
    Ok(hex::encode(hash_bytes))
}

/// ハッシュファイルの中から特定のファイル名に対応するハッシュ値を取得
fn find_hash_for_file(hashes_content: &str, filename: &str) -> Option<String> {
    hashes_content.lines()
        .find(|line| line.ends_with(filename))
        .and_then(|line| line.split_whitespace().next().map(str::to_string))
}


// --- 公開関数 ---

/// yt-dlpの更新を確認し、必要であればダウンロードと検証を行う
#[tauri::command]
pub async fn check_and_update(app_handle: tauri::AppHandle) -> Result<String, String> {
    let emit_data = EmitterData {
        status: "更新を確認中...".to_string(),
        progress: 0
    };
    app_handle.emit("ytdlp_status", emit_data).map_err(|e| e.to_string())?;
    
    let local_version = get_local_version(&app_handle).map_err(|e| e.to_string())?;
    let http_client = reqwest::Client::new();
    let latest_release = get_latest_release(&http_client).await.map_err(|e| e.to_string())?;
    
    if local_version >= latest_release.tag_name {
        println!("yt-dlpは最新です: {}", local_version);
        let emit_data = EmitterData {
            status: format!("準備完了 (バージョン: {})", local_version),
            progress: 100
        };
        
        app_handle.emit("ytdlp_status", emit_data).map_err(|e| e.to_string())?;
        return Ok("already_latest".to_string());
    }

    println!("新しいバージョンが見つかりました: {} -> {}", local_version, latest_release.tag_name);
    let emit_data = EmitterData {
        status: format!("新バージョン {} をダウンロード中...", latest_release.tag_name),
        progress: 33
    };
    app_handle.emit("ytdlp_status", emit_data).map_err(|e| e.to_string())?;

    let exe_asset = latest_release.assets.iter().find(|a| a.name == YTDLP_EXECUTABLE_NAME).ok_or("実行ファイルが見つかりません".to_string())?;
    let hash_asset = latest_release.assets.iter().find(|a| a.name == "SHA2-256SUMS").ok_or("ハッシュファイルが見つかりません".to_string())?;

    let temp_dir = app_handle.path().temp_dir().map_err(|e| e.to_string())?;
    let temp_exe_path = temp_dir.join(YTDLP_EXECUTABLE_NAME);
    let temp_hash_path = temp_dir.join("SHA2-256SUMS");

    download_file(&http_client, &hash_asset.browser_download_url, &temp_hash_path).await.map_err(|e| e.to_string())?;
    download_file(&http_client, &exe_asset.browser_download_url, &temp_exe_path).await.map_err(|e| e.to_string())?;
    
    let emit_data = EmitterData {
        status: "ハッシュを検証中...".to_string(),
        progress: 66
    };
    app_handle.emit("ytdlp_status", emit_data).map_err(|e| e.to_string())?;

    let hashes_content = std::fs::read_to_string(&temp_hash_path).map_err(|e| e.to_string())?;
    let expected_hash = find_hash_for_file(&hashes_content, YTDLP_EXECUTABLE_NAME).ok_or("ハッシュが見つかりません".to_string())?;
    let actual_hash = calculate_sha256(&temp_exe_path).map_err(|e| e.to_string())?;

    if expected_hash != actual_hash {
        return Err("ハッシュの検証に失敗しました！".to_string());
    }
    
    println!("ハッシュの検証に成功しました。");

    let final_exe_path = get_executable_path(&app_handle).map_err(|e| e.to_string())?;
    if let Some(parent) = final_exe_path.parent() {
        if !parent.exists() { std::fs::create_dir_all(parent).map_err(|e| e.to_string())?; }
    }
    std::fs::rename(&temp_exe_path, &final_exe_path).map_err(|e| e.to_string())?;

    #[cfg(not(target_os = "windows"))]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&final_exe_path, std::fs::Permissions::from_mode(0o755)).map_err(|e| e.to_string())?;
    }

    let version_file_path = app_handle.path().app_data_dir().map_err(|e| e.to_string())?.join(VERSION_FILE_NAME);
    std::fs::write(version_file_path, latest_release.tag_name.clone()).map_err(|e| e.to_string())?;

    let emit_data = EmitterData {
        status: format!("更新完了 (バージョン: {})", latest_release.tag_name),
        progress: 100
    };
    app_handle.emit("ytdlp_status", emit_data).map_err(|e| e.to_string())?;
    println!("yt-dlpの更新が完了しました。");
    
    Ok("updated".to_string())
}


import React, { useState, useRef, useEffect, FC } from "react";
import "./VideoPlayer.css"; // 対応するCSSファイルをインポートしてください
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaSpinner,
  FaCog, // 設定アイコンを追加
} from "react-icons/fa";
import { invoke } from "@tauri-apps/api/core";

// --- 型定義 (変更なし) ---
interface VideoInfo {
  title: string;
  duration: string;
  url: string;
  formats: VideoFormat[];
}

interface VideoFormat {
  format_id: string;
  ext: string;
  quality: string;
  url: string;
}

interface SettingVideoFormat {
  id: string;
  quality: string;
  codec: string;
  hfr: boolean;
}

interface SettingAudioFormat {
  id: string;
  quality: string;
  codec: string;
}

// --- データ取得関数 (変更なし) ---
const getVideoFormats = async (youtubeUrl: string) => {
  const info = await invoke<VideoInfo>("get_video_info", {
    videoUrl: youtubeUrl,
  });
  console.log("Video info:", info);
  // (フォーマットのハードコード部分は省略)
  const audioFormats: SettingAudioFormat[] = [];
  const videoFormats: SettingVideoFormat[] = [];

  for (const format of info.formats) {
    if (format.format_id === "249")
      audioFormats.push({
        id: "249",
        quality: "50kbps",
        codec: "opus",
      });
    else if (format.format_id === "250")
      audioFormats.push({
        id: "250",
        quality: "70kbps",
        codec: "opus",
      });
    else if (format.format_id === "251")
      audioFormats.push({
        id: "251",
        quality: "128kbps",
        codec: "opus",
      });
  }

  for (const format of info.formats) {
    // H.264
    if (format.format_id === "135")
      videoFormats.push({
        id: "135",
        quality: "480p",
        codec: "h264",
        hfr: false,
      });
    else if (format.format_id === "136")
      videoFormats.push({
        id: "136",
        quality: "720p",
        codec: "h264",
        hfr: false,
      });
    else if (format.format_id === "137")
      videoFormats.push({
        id: "137",
        quality: "1080p",
        codec: "h264",
        hfr: false,
      });
    // H.264 HFR
    else if (format.format_id === "298")
      videoFormats.push({
        id: "298",
        quality: "720p",
        codec: "h264",
        hfr: true,
      });
    else if (format.format_id === "299")
      videoFormats.push({
        id: "299",
        quality: "1080p",
        codec: "h264",
        hfr: true,
      });
    else if (format.format_id === "304")
      videoFormats.push({
        id: "304",
        quality: "1440p",
        codec: "h264",
        hfr: true,
      });
    else if (format.format_id === "305")
      videoFormats.push({
        id: "305",
        quality: "2160p",
        codec: "h264",
        hfr: true,
      });
    // VP9
    else if (format.format_id === "244")
      videoFormats.push({
        id: "244",
        quality: "480p",
        codec: "vp9",
        hfr: false,
      });
    else if (format.format_id === "247")
      videoFormats.push({
        id: "247",
        quality: "720p",
        codec: "vp9",
        hfr: false,
      });
    else if (format.format_id === "248")
      videoFormats.push({
        id: "248",
        quality: "1080p",
        codec: "vp9",
        hfr: false,
      });
    else if (format.format_id === "271")
      videoFormats.push({
        id: "271",
        quality: "1440p",
        codec: "vp9",
        hfr: false,
      });
    else if (format.format_id === "313")
      videoFormats.push({
        id: "313",
        quality: "2160p",
        codec: "vp9",
        hfr: false,
      });
    // VP9 HFR
    else if (format.format_id === "333")
      videoFormats.push({
        id: "333",
        quality: "480p",
        codec: "vp9",
        hfr: true,
      });
    else if (format.format_id === "302")
      videoFormats.push({
        id: "302",
        quality: "720p",
        codec: "vp9",
        hfr: true,
      });
    else if (format.format_id === "303")
      videoFormats.push({
        id: "303",
        quality: "1080p",
        codec: "vp9",
        hfr: true,
      });
    else if (format.format_id === "308")
      videoFormats.push({
        id: "308",
        quality: "1440p",
        codec: "vp9",
        hfr: true,
      });
    else if (format.format_id === "315")
      videoFormats.push({
        id: "315",
        quality: "2160p",
        codec: "vp9",
        hfr: true,
      });
    // AV1
    else if (format.format_id === "397")
      videoFormats.push({
        id: "397",
        quality: "480p",
        codec: "av1",
        hfr: false,
      });
    else if (format.format_id === "398")
      videoFormats.push({
        id: "398",
        quality: "720p",
        codec: "av1",
        hfr: false,
      });
    else if (format.format_id === "399")
      videoFormats.push({
        id: "399",
        quality: "1080p",
        codec: "av1",
        hfr: false,
      });
    else if (format.format_id === "401")
      videoFormats.push({
        id: "401",
        quality: "2160p",
        codec: "av1",
        hfr: false,
      });
    // AV1 HFR
    else if (format.format_id === "698")
      videoFormats.push({
        id: "698",
        quality: "720p",
        codec: "av1",
        hfr: true,
      });
    else if (format.format_id === "699")
      videoFormats.push({
        id: "699",
        quality: "1080p",
        codec: "av1",
        hfr: true,
      });
    else if (format.format_id === "700")
      videoFormats.push({
        id: "700",
        quality: "1440p",
        codec: "av1",
        hfr: true,
      });
    else if (format.format_id === "701")
      videoFormats.push({
        id: "701",
        quality: "2160p",
        codec: "av1",
        hfr: true,
      });
  }

  // 最高の品質をデフォルトにするためにソートする例 (任意)
  videoFormats.sort((a, b) => parseInt(b.quality) - parseInt(a.quality));
  audioFormats.sort((a, b) => parseInt(b.quality) - parseInt(a.quality));

  return {
    videoFormats,
    audioFormats,
  };
};

const getStreamingUrl = async (url: string, format: string) => {
  const streamUrl = await invoke<string>("get_proxy_url", {
    videoUrl: url,
    formatId: format,
  });
  console.log(`Stream URL for format ${format}:`, streamUrl);
  return streamUrl;
};

/**
 * 動画と音声が別のファイルを同期再生するカスタムビデオプレイヤーコンポーネント
 */
const VideoPlayer: FC<{ youtubeUrl: string }> = ({ youtubeUrl }) => {
  // --- DOM要素への参照 (変更なし) ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- プレイヤーの状態管理 (追加・変更あり) ---
  const [videoSrc, setVideoSrc] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [videoFormats, setVideoFormats] = useState<SettingVideoFormat[]>([]);
  const [audioFormats, setAudioFormats] = useState<SettingAudioFormat[]>([]);
  const [selectedVideoFormatId, setSelectedVideoFormatId] = useState<
    string | null
  >(null);
  const [selectedAudioFormatId, setSelectedAudioFormatId] = useState<
    string | null
  >(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // 初期ロードはtrue
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // 設定メニューの開閉

  // シーク操作の状態管理
  const [isSeeking, setIsSeeking] = useState(false);
  const wasPlayingBeforeSeekRef = useRef(false);

  // --- Hooks (Effects) ---

  // 初期化: フォーマット情報を取得し、デフォルトのストリームを設定
  useEffect(() => {
    const initializePlayer = async () => {
      setIsLoading(true);
      try {
        const { videoFormats, audioFormats } = await getVideoFormats(
          youtubeUrl
        );
        setVideoFormats(videoFormats);
        setAudioFormats(audioFormats);

        if (videoFormats.length > 0 && audioFormats.length > 0) {
          // 最高品質をデフォルトとして選択
          const defaultVideoFormat = videoFormats[0];
          const defaultAudioFormat = audioFormats[0];

          setSelectedVideoFormatId(defaultVideoFormat.id);
          setSelectedAudioFormatId(defaultAudioFormat.id);

          const [videoUrl, audioUrl] = await Promise.all([
            getStreamingUrl(youtubeUrl, defaultVideoFormat.id),
            getStreamingUrl(youtubeUrl, defaultAudioFormat.id),
          ]);
          setVideoSrc(videoUrl);
          setAudioSrc(audioUrl);
          setIsPlaying(true);
        }
      } catch (error) {
        console.error("Error initializing player:", error);
      }
      // メタデータがロードされるまでisLoadingは維持される
    };

    initializePlayer();
  }, [youtubeUrl]);

  // isPlayingの状態に応じて再生/一時停止を制御
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio || isSeeking || isLoading) return;

    if (isPlaying) {
      video.play().catch((err) => console.error("Video play failed:", err));
      audio.play().catch((err) => console.error("Audio play failed:", err));
    } else {
      video.pause();
      audio.pause();
    }
  }, [isPlaying, isSeeking, isLoading]);

  // メディアのメタデータ（総再生時間など）の読み込み
  useEffect(() => {
    const video = videoRef.current;
    const handleLoadedMetadata = () => {
      if (video) {
        setDuration(video.duration);
        setIsLoading(false); // メタデータが読み込めたらローディング終了
      }
    };
    video?.addEventListener("loadedmetadata", handleLoadedMetadata);
    // ローディング状態のハンドリング
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video?.addEventListener("waiting", handleWaiting);
    video?.addEventListener("canplay", handleCanPlay);

    return () => {
      video?.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video?.removeEventListener("waiting", handleWaiting);
      video?.removeEventListener("canplay", handleCanPlay);
    };
  }, [videoSrc]); // videoSrcが変わるたびに再設定

  // 定期的な同期チェック (堅牢性のための追加)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const video = videoRef.current;
      const audio = audioRef.current;
      if (video && audio && isPlaying && !isSeeking) {
        const diff = Math.abs(video.currentTime - audio.currentTime);
        // 0.2秒以上のズレがあったら強制的に同期
        if (diff > 0.2) {
          console.warn(`Sync issue detected. Diff: ${diff}s. Resyncing.`);
          audio.currentTime = video.currentTime; // 音声を動画に合わせる
          setIsLoading(true); // 同期中はローディング状態にする
        }
        // 音量を元に戻す
      }
    }, 250); // 250msごとにチェック

    return () => clearInterval(syncInterval);
  }, [isPlaying, isSeeking]);

  // 再生時間の更新
  useEffect(() => {
    const video = videoRef.current;
    const handleTimeUpdate = () => {
      if (video && !isSeeking) setCurrentTime(video.currentTime);
    };
    video?.addEventListener("timeupdate", handleTimeUpdate);
    return () => video?.removeEventListener("timeupdate", handleTimeUpdate);
  }, [isSeeking]);

  // バッファリング状況の更新
  useEffect(() => {
    const video = videoRef.current;
    const handleProgress = () => {
      if (video && video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    video?.addEventListener("progress", handleProgress);
    return () => video?.removeEventListener("progress", handleProgress);
  }, []);

  // 全画面表示状態の監視
  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // --- Event Handlers ---

  const handleMouseMove = () => {
    setAreControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setAreControlsVisible(false);
    }, 3000);
  };
  const handleMouseLeave = () => {
    if (isPlaying) {
      setAreControlsVisible(false);
      setIsSettingsOpen(false); // カーソルが離れたら設定も閉じる
    }
  };

  const togglePlayPause = () => {
    if (isLoading) return; // 読み込み中は操作不可
    setIsPlaying(!isPlaying);
  };

  // 【新規】フォーマット変更処理
  const changeFormat = async (type: "video" | "audio", newFormatId: string) => {
    setIsLoading(true);
    const wasPlaying = isPlaying; // 現在の再生状態を保存
    setIsPlaying(false); // フォーマット変更中は一時停止

    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    audio.pause(); // 音声も一時停止
    video.pause(); // フォーマット変更中は両方一時停止
    // 現在の状態を保存
    const savedTime = video.currentTime;

    setIsSettingsOpen(false); // メニューを閉じる

    try {
      const newUrl = await getStreamingUrl(youtubeUrl, newFormatId);

      const mediaElement = type === "video" ? video : audio;
      const setSrcFunction = type === "video" ? setVideoSrc : setAudioSrc;
      const setSelectedFormat =
        type === "video" ? setSelectedVideoFormatId : setSelectedAudioFormatId;

      // メディアが新しいソースで準備完了するのを待つPromise
      const readyPromise = new Promise<void>((resolve, reject) => {
        const onLoadedData = () => {
          mediaElement.currentTime = savedTime;
        };
        const onSeeked = () => {
          mediaElement.removeEventListener("loadeddata", onLoadedData);
          mediaElement.removeEventListener("seeked", onSeeked);
          mediaElement.removeEventListener("error", onError);
          resolve();
        };
        const onError = (e: Event) => {
          mediaElement.removeEventListener("loadeddata", onLoadedData);
          mediaElement.removeEventListener("seeked", onSeeked);
          mediaElement.removeEventListener("error", onError);
          console.error(`Error loading new ${type} format`, e);
          reject(new Error(`Failed to load ${type} stream.`));
        };

        mediaElement.addEventListener("loadeddata", onLoadedData);
        mediaElement.addEventListener("seeked", onSeeked);
        mediaElement.addEventListener("error", onError);
      });

      // ソースを更新して読み込みを開始
      setSrcFunction(newUrl);
      mediaElement.load();
      setSelectedFormat(newFormatId);

      await readyPromise;

      // 同期を最終確認
      if (type === "video") {
        audio.currentTime = video.currentTime;
      } else {
        video.currentTime = audio.currentTime;
      }
    } catch (error) {
      console.error("Failed to switch format:", error);
      // エラーが発生した場合、古いソースに戻すなどのフォールバック処理も検討できる
    } finally {
      setIsLoading(false);
      if (wasPlaying) {
        setIsPlaying(true); // 再生を再開
      }
    }
  };

  const handleSeekMouseDown = () => {
    if (isLoading) return;
    wasPlayingBeforeSeekRef.current = isPlaying;
    setIsSeeking(true);
    if (isPlaying) {
      setIsPlaying(false);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (videoRef.current) videoRef.current.currentTime = seekTime;
    if (audioRef.current) audioRef.current.currentTime = seekTime;
  };

  const handleSeekMouseUp = async () => {
    setIsSeeking(false);
    if (wasPlayingBeforeSeekRef.current) {
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (videoRef.current) videoRef.current.volume = newVolume;
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (videoRef.current) videoRef.current.muted = newMutedState;
    if (audioRef.current) audioRef.current.muted = newMutedState;

    if (!newMutedState && volume === 0) {
      const newVolume = 0.5;
      setVolume(newVolume);
      if (videoRef.current) videoRef.current.volume = newVolume;
      if (audioRef.current) audioRef.current.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    const playerContainer = playerContainerRef.current;
    if (!playerContainer) return;
    if (!isFullscreen) {
      playerContainer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds === 0) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div
      ref={playerContainerRef}
      className={`video-player-container ${
        areControlsVisible ? "controls-visible" : ""
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {isLoading && (
        <div className="loading-spinner-overlay">
          <FaSpinner className="loading-spinner" />
        </div>
      )}

      <video
        ref={videoRef}
        src={videoSrc}
        onClick={togglePlayPause}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        muted // 音声は<audio>要素から出すため、常にミュート
      />
      <audio ref={audioRef} src={audioSrc} />

      <div className="controls-overlay">
        {/* --- 設定メニュー --- */}
        {isSettingsOpen && (
          <div className="settings-menu">
            <div className="settings-section">
              <h4>画質</h4>
              {videoFormats.map((format) => (
                <button
                  key={format.id}
                  className={`settings-button ${
                    selectedVideoFormatId === format.id ? "active-format" : ""
                  }`}
                  onClick={() => changeFormat("video", format.id)}
                >
                  {format.quality}
                  {format.hfr ? " HFR" : ""} ({format.codec})
                </button>
              ))}
            </div>
            <div className="settings-section">
              <h4>音声</h4>
              {audioFormats.map((format) => (
                <button
                  key={format.id}
                  className={`settings-button ${
                    selectedAudioFormatId === format.id ? "active-format" : ""
                  }`}
                  onClick={() => changeFormat("audio", format.id)}
                >
                  {format.quality} ({format.codec})
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="progress-bar-container">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onMouseDown={handleSeekMouseDown}
            onChange={handleSeekChange}
            onMouseUp={handleSeekMouseUp}
            className="progress-bar"
            style={
              {
                "--buffered-width": `${(buffered / duration) * 100}%`,
                "--progress-width": `${(currentTime / duration) * 100}%`,
              } as React.CSSProperties
            }
          />
        </div>

        <div className="controls">
          <div className="controls-left">
            <button onClick={togglePlayPause} className="control-button">
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <div className="volume-container">
              <button onClick={toggleMute} className="control-button">
                {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider"
                style={
                  {
                    "--volume-width": `${isMuted ? 0 : volume * 100}%`,
                  } as React.CSSProperties
                }
              />
            </div>
            <span className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="controls-right">
            {/* --- 設定ボタン --- */}
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="control-button"
            >
              <FaCog />
            </button>
            <button onClick={toggleFullscreen} className="control-button">
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

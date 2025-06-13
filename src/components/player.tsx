import React, { useState, useRef, useEffect } from "react";
import "./VideoPlayer.css"; // 対応するCSSファイルをインポートしてください
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaSpinner,
} from "react-icons/fa";

/**
 * Propsの型定義
 * @param videoSrc - 動画ファイルのURL
 * @param audioSrc - 音声ファイルのURL
 */
interface VideoPlayerProps {
  videoSrc: string;
  audioSrc: string;
}

/**
 * 動画と音声が別のファイルを同期再生するカスタムビデオプレイヤーコンポーネント
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoSrc, audioSrc }) => {
  // DOM要素への参照
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // プレイヤーの状態管理
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(true);

  // シーク操作の状態管理
  const [isSeeking, setIsSeeking] = useState(false);
  const [wasPlayingBeforeSeek, setWasPlayingBeforeSeek] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- Hooks (Effects) ---

  // isPlayingの状態に応じて再生/一時停止を制御
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio || isSeeking) return;

    if (isPlaying) {
      video.play().catch((err) => console.error("Video play failed:", err));
      audio.play().catch((err) => console.error("Audio play failed:", err));
    } else {
      video.pause();
      audio.pause();
    }
  }, [isPlaying, isSeeking]);

  // メディアのメタデータ（総再生時間など）の読み込み
  useEffect(() => {
    const video = videoRef.current;
    const handleLoadedMetadata = () => {
      if (video) setDuration(video.duration);
    };
    video?.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () =>
      video?.removeEventListener("loadedmetadata", handleLoadedMetadata);
  }, []);

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

  // コントロールの表示/非表示
  const handleMouseMove = () => {
    setAreControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setAreControlsVisible(false);
    }, 3000);
  };
  const handleMouseLeave = () => {
    if (isPlaying) setAreControlsVisible(false);
  };

  // 再生/一時停止ボタンのクリック
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // シークバーを押した時の処理
  const handleSeekMouseDown = () => {
    const video = videoRef.current;
    if (!video) return;
    setWasPlayingBeforeSeek(isPlaying); // シーク前の再生状態を記憶
    setIsSeeking(true);
    if (isPlaying) {
      setIsPlaying(false); // 再生を一時停止
    }
  };

  // シークバーをドラッグしている時の処理
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    video.currentTime = seekTime;
    audio.currentTime = seekTime;
  };

  // シークバーからマウスを離した時の処理
  const handleSeekMouseUp = async () => {
    setIsSeeking(false);
    if (wasPlayingBeforeSeek) {
      const video = videoRef.current;
      const audio = audioRef.current;
      if (!video || !audio) return;

      setIsLoading(true); // ローディングスピナー表示

      // メディアが再生可能になるのを待つヘルパー関数
      const waitForCanPlay = (mediaElement: HTMLMediaElement) => {
        return new Promise<void>((resolve) => {
          const onCanPlay = () => {
            mediaElement.removeEventListener("canplay", onCanPlay);
            resolve();
          };
          if (mediaElement.readyState >= 3) {
            // HAVE_FUTURE_DATA
            resolve();
          } else {
            mediaElement.addEventListener("canplay", onCanPlay);
          }
        });
      };

      try {
        await Promise.all([waitForCanPlay(video), waitForCanPlay(audio)]);
      } catch (error) {
        console.error("Error waiting for media to be ready:", error);
      } finally {
        setIsLoading(false); // ローディングスピナー非表示
        setIsPlaying(true); // 再生を再開
      }
    }
  };

  // 音量スライダーの操作
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    video.volume = newVolume;
    audio.volume = newVolume;
  };

  // ミュートボタンのクリック
  const toggleMute = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    video.muted = newMutedState;
    audio.muted = newMutedState;
    if (!newMutedState && volume === 0) {
      const newVolume = 0.5;
      setVolume(newVolume);
      video.volume = newVolume;
      audio.volume = newVolume;
    }
  };

  // 全画面表示ボタンのクリック
  const toggleFullscreen = () => {
    const playerContainer = playerContainerRef.current;
    if (!playerContainer) return;
    if (!isFullscreen) {
      playerContainer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // 時間を MM:SS 形式にフォーマット
  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  // --- JSX Rendering ---

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
        muted
      />
      <audio ref={audioRef} src={audioSrc} />

      <div className="controls-overlay">
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

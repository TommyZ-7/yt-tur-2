import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  MoreVertical,
  Check,
} from "lucide-react";

import { invoke } from "@tauri-apps/api/core";

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

// ダミー関数
const getVideoFormats = async (youtubeUrl: string) => {
  const info = await invoke<VideoInfo>("get_video_info", {
    videoUrl: youtubeUrl,
  });
  console.log("Video info:", info);
  await new Promise((resolve) => setTimeout(resolve, 500));

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
  console.log("Video formats:", videoFormats);
  console.log("Audio formats:", audioFormats);
  return {
    videoFormats,
    audioFormats,
  };
};

const getStreamingUrl = async (url: string, format: string) => {
  const StreamUrl = await invoke<string>("get_proxy_url", {
    videoUrl: url,
    formatId: format,
  });

  console.log("Video stream URL:", StreamUrl);

  return StreamUrl;
};

interface VideoFormat {
  id: string;
  quality: string;
  codec: string;
}

interface VideoPlayerProps {
  youtubeUrl: string;
}

const VideoPlayer2: React.FC<VideoPlayerProps> = ({ youtubeUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const [videoFormats, setVideoFormats] = useState<SettingVideoFormat[]>([]);
  const [audioFormats, setAudioFormats] = useState<SettingAudioFormat[]>([]);
  const [selectedVideoFormat, setSelectedVideoFormat] = useState("137");
  const [selectedAudioFormat, setSelectedAudioFormat] = useState("140");

  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [formatsLoading, setFormatsLoading] = useState(false);
  const [streamsLoading, setStreamsLoading] = useState(false);

  // コントロール表示/非表示制御
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    if (isPlaying) {
      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // マウス操作でコントロール表示
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = () => showControlsTemporarily();
    const handleMouseLeave = () => {
      if (isPlaying) {
        setShowControls(false);
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [showControlsTemporarily, isPlaying]);

  // 再生状態が変わったときのコントロール表示制御
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    } else {
      showControlsTemporarily();
    }
  }, [isPlaying, showControlsTemporarily]);

  // フォーマット一覧を取得
  const loadFormats = useCallback(async () => {
    if (!youtubeUrl) return;

    setFormatsLoading(true);
    try {
      const formats = await getVideoFormats(youtubeUrl);
      setVideoFormats(formats.videoFormats);
      setAudioFormats(formats.audioFormats);
    } catch (error) {
      console.error("フォーマット取得エラー:", error);
    } finally {
      setFormatsLoading(false);
    }
  }, [youtubeUrl]);

  // ストリーミングURLを取得
  const loadStreams = useCallback(async () => {
    if (!youtubeUrl || !selectedVideoFormat || !selectedAudioFormat) return;

    setStreamsLoading(true);
    try {
      const [vUrl, aUrl] = await Promise.all([
        getStreamingUrl(youtubeUrl, selectedVideoFormat),
        getStreamingUrl(youtubeUrl, selectedAudioFormat),
      ]);
      setVideoUrl(vUrl);
      setAudioUrl(aUrl);
    } catch (error) {
      console.error("ストリーム取得エラー:", error);
    } finally {
      setStreamsLoading(false);
    }
  }, [youtubeUrl, selectedVideoFormat, selectedAudioFormat]);

  // 初期化
  useEffect(() => {
    loadFormats();
  }, [loadFormats]);

  // フォーマット選択後にストリーム取得
  useEffect(() => {
    if (videoFormats.length > 0 && audioFormats.length > 0) {
      loadStreams();
    }
  }, [loadStreams, videoFormats, audioFormats]);

  // 動画と音声の同期制御
  const syncPlayback = useCallback(async () => {
    if (!videoRef.current || !audioRef.current) return;

    const video = videoRef.current;
    const audio = audioRef.current;

    await Promise.all([
      new Promise((resolve) => {
        if (video.readyState >= 3) resolve(null);
        else
          video.addEventListener("canplay", () => resolve(null), {
            once: true,
          });
      }),
      new Promise((resolve) => {
        if (audio.readyState >= 3) resolve(null);
        else
          audio.addEventListener("canplay", () => resolve(null), {
            once: true,
          });
      }),
    ]);

    const targetTime = Math.max(video.currentTime, audio.currentTime);
    video.currentTime = targetTime;
    audio.currentTime = targetTime;

    if (isPlaying) {
      await Promise.all([video.play(), audio.play()]);
    } else {
      video.pause();
      audio.pause();
    }
  }, [isPlaying]);

  // 再生制御
  const togglePlay = async () => {
    if (!videoRef.current || !audioRef.current) return;

    setIsLoading(true);

    try {
      if (isPlaying) {
        videoRef.current.pause();
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await syncPlayback();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("再生エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 時間更新
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
    };

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateTime);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateTime);
    };
  }, [videoUrl]);

  // シーク操作
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !audioRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    videoRef.current.currentTime = newTime;
    audioRef.current.currentTime = newTime;
  };

  // 音量制御
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  // 時間フォーマット
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const isStreamReady = videoUrl && audioUrl && !streamsLoading;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto bg-black rounded overflow-hidden cursor-pointer"
    >
      {/* メインビデオエリア */}
      <div className="relative aspect-video bg-black">
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            muted
          />
        )}

        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                audioRef.current.volume = volume;
              }
            }}
            muted={isMuted}
          />
        )}

        {/* ローディングスピナー（中央小さく） */}
        {(formatsLoading || streamsLoading || isLoading) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* 中央再生ボタン（YouTube風） */}
        {!isPlaying && isStreamReady && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            onClick={togglePlay}
          >
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors duration-200">
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </div>
          </div>
        )}

        {/* コントロールバー */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* プログレスバー */}
          <div
            className="w-full h-1 bg-white/30 cursor-pointer mb-3 group"
            onClick={handleSeek}
          >
            <div className="relative h-full">
              <div
                className="h-full bg-red-600 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 w-3 h-3 bg-red-600 rounded-full transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* 左側コントロール */}
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                disabled={!isStreamReady}
                className="text-white hover:text-red-400 transition-colors duration-200 disabled:opacity-50"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>

              <div className="flex items-center space-x-2 group">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-red-400 transition-colors duration-200"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                <div className="w-0 group-hover:w-16 transition-all duration-200 overflow-hidden">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) =>
                      handleVolumeChange(parseFloat(e.target.value))
                    }
                    className="w-16 h-1 bg-white/30 appearance-none cursor-pointer slider"
                  />
                </div>
              </div>

              <div className="text-white text-xs font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* 右側コントロール */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-red-400 transition-colors duration-200"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* YouTube風設定メニュー */}
              {showSettings && (
                <div className="absolute bottom-8 right-0 bg-gray-900 rounded-lg shadow-xl min-w-48 z-50 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="py-2">
                    {/* 映像品質 */}
                    <div className="px-4 py-2 text-white text-sm font-medium border-b border-gray-700">
                      映像品質
                    </div>
                    {videoFormats.map((format) => (
                      <button
                        key={format.id}
                        onClick={() => {
                          setSelectedVideoFormat(format.id);
                          loadStreams();
                          setShowSettings(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800 transition-colors duration-150 flex items-center justify-between"
                      >
                        <span>{format.quality}</span>
                        {selectedVideoFormat === format.id && (
                          <Check className="w-4 h-4 text-red-500" />
                        )}
                      </button>
                    ))}

                    {/* 音声品質 */}
                    <div className="px-4 py-2 text-white text-sm font-medium border-b border-gray-700 border-t">
                      音声品質
                    </div>
                    {audioFormats.map((format) => (
                      <button
                        key={format.id}
                        onClick={() => {
                          setSelectedAudioFormat(format.id);
                          loadStreams();
                          setShowSettings(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800 transition-colors duration-150 flex items-center justify-between"
                      >
                        <span>{format.quality}</span>
                        {selectedAudioFormat === format.id && (
                          <Check className="w-4 h-4 text-red-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 設定メニュー外クリックで閉じる */}
      {showSettings && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSettings(false)}
        />
      )}

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #dc2626;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #dc2626;
          cursor: pointer;
          border: none;
        }

        .animate-in {
          animation: slideIn 0.2s ease-out;
        }

        .slide-in-from-bottom-2 {
          animation: slideInFromBottom 0.2s ease-out;
        }

        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer2;

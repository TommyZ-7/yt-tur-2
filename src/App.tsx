"use client";
import React, { useState, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Play,
  Pause,
  Download,
  Search,
  Volume2,
  Maximize,
  Settings,
} from "lucide-react";

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

const YouTubeStreamer = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [streamUrl, setStreamUrl] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<number>();

  const extractVideoId = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const isValidYouTubeUrl = (url: string): boolean => {
    return extractVideoId(url) !== null;
  };

  const handleGetVideoInfo = async () => {
    if (!videoUrl.trim()) {
      setError("YouTubeのURLを入力してください");
      return;
    }

    if (!isValidYouTubeUrl(videoUrl)) {
      setError("有効なYouTubeのURLを入力してください");
      return;
    }

    setIsLoading(true);
    setError("");
    setVideoInfo(null);
    setStreamUrl("");

    try {
      const info = await invoke<VideoInfo>("get_video_info", { videoUrl });
      setVideoInfo(info);

      // デフォルトで最高品質のフォーマットを選択
      if (info.formats.length > 0) {
        const bestFormat =
          info.formats.find((f) => f.quality.includes("720p")) ||
          info.formats[0];
        setSelectedFormat(bestFormat.format_id);
      }
    } catch (err) {
      setError(`エラー: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamVideo = async () => {
    if (!videoInfo) return;

    setIsLoading(true);
    setError("");

    try {
      const url = await invoke<string>("get_stream_url", {
        videoUrl: videoInfo.url,
        formatId: selectedFormat || null,
      });
      setStreamUrl(url);
    } catch (err) {
      setError(`ストリーミングエラー: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo) return;

    setIsLoading(true);
    setError("");

    try {
      const outputPath = `./downloads/%(title)s.%(ext)s`;
      await invoke<string>("download_video", {
        videoUrl: videoInfo.url,
        outputPath,
        formatId: selectedFormat || null,
      });
      alert("ダウンロードが完了しました！");
    } catch (err) {
      setError(`ダウンロードエラー: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (video) {
      const newTime = parseFloat(e.target.value);
      video.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          YouTube Streamer
        </h1>

        {/* URL入力セクション */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="YouTubeのURLを入力してください"
              className="flex-1 px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && handleGetVideoInfo()}
            />
            <button
              onClick={handleGetVideoInfo}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Search size={18} />
              検索
            </button>
          </div>

          {error && (
            <div className="bg-red-600 text-white p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
        </div>

        {/* 動画情報セクション */}
        {videoInfo && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{videoInfo.title}</h2>
            <p className="text-gray-300 mb-4">再生時間: {videoInfo.duration}</p>

            {/* フォーマット選択 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                品質を選択:
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {videoInfo.formats.map((format) => (
                  <option key={format.format_id} value={format.format_id}>
                    {format.quality} ({format.ext})
                  </option>
                ))}
              </select>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-3">
              <button
                onClick={handleStreamVideo}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <Play size={18} />
                ストリーミング再生
              </button>
              <button
                onClick={handleDownload}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <Download size={18} />
                ダウンロード
              </button>
            </div>
          </div>
        )}

        {/* 動画プレイヤー */}
        {streamUrl && (
          <div className="bg-black rounded-lg overflow-hidden relative">
            <div
              className="relative"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setShowControls(false)}
            >
              <video
                ref={videoRef}
                src={streamUrl}
                className="w-full h-auto max-h-96 object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                crossOrigin="anonymous"
              />

              {/* カスタムコントロール */}
              <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                  showControls ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* プログレスバー */}
                <div className="mb-3">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                        (currentTime / duration) * 100
                      }%, #4b5563 ${
                        (currentTime / duration) * 100
                      }%, #4b5563 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-300 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* コントロールボタン */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayPause}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    <div className="flex items-center gap-2">
                      <Volume2 size={18} />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                      <Settings size={18} />
                    </button>
                    <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                      <Maximize size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeStreamer;

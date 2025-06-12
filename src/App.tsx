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

// バックエンドの構造体に合わせてurlフィールドを削除
interface VideoInfo {
  title: string;
  duration: string;
  formats: VideoFormat[];
}

interface VideoFormat {
  format_id: string;
  ext: string;
  quality: string;
}

const App = () => {
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

  // 変更点: invokeを呼ばずにカスタムプロトコルURLを直接組み立てる
  const handleStreamVideo = () => {
    if (!videoInfo || !videoUrl) return;
    setError("");

    // URLパラメータをエンコード
    const encodedVideoUrl = encodeURIComponent(videoUrl);

    // "stream://" スキームでURLを構築
    let url = `http://stream.localhost?video_url=${encodedVideoUrl}`;

    if (selectedFormat) {
      const encodedFormatId = encodeURIComponent(selectedFormat);
      url += `&format_id=${encodedFormatId}`;
    }

    setStreamUrl(url);
  };

  // 変更点: videoInfo.urlの代わりにstateのvideoUrlを使用
  const handleDownload = async () => {
    if (!videoInfo || !videoUrl) return;
    setIsLoading(true);
    setError("");
    try {
      const outputPath = `downloads/%(title)s.%(ext)s`;
      await invoke<string>("download_video", {
        videoUrl: videoUrl, // videoInfo.urlではなく、元のURLを使用
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
    } else {
      video.pause();
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) setCurrentTime(video.currentTime);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) setDuration(video.duration);
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
    if (videoRef.current) videoRef.current.volume = newVolume;
  };

  const formatTime = (time: number): string => {
    if (isNaN(time) || time === 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          YouTube Streamer
        </h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
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
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              <Search size={18} />
              <span>検索</span>
            </button>
          </div>
          {error && (
            <div className="bg-red-600 text-white p-3 rounded-lg">{error}</div>
          )}
        </div>

        {videoInfo && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">{videoInfo.title}</h2>
            <p className="text-gray-300 mb-4">再生時間: {videoInfo.duration}</p>
            <div className="mb-4">
              <label
                htmlFor="quality-select"
                className="block text-sm font-medium mb-2"
              >
                品質を選択:
              </label>
              <select
                id="quality-select"
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
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleStreamVideo}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                <Play size={18} />
                ストリーミング再生
              </button>
              <button
                onClick={handleDownload}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                <Download size={18} />
                ダウンロード
              </button>
            </div>
          </div>
        )}

        {streamUrl && (
          <div
            className="bg-black rounded-lg overflow-hidden relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setShowControls(false)}
          >
            <video
              ref={videoRef}
              src={streamUrl} // ここに "stream://..." のURLが設定される
              className="w-full h-auto max-h-[70vh] object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={togglePlayPause}
              autoPlay
            />
            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                showControls || !isPlaying ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="mb-3">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 ${
                      (currentTime / duration) * 100
                    }%, #4b5563 ${(currentTime / duration) * 100}%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-gray-300 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
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
                      step="0.05"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
                {/* <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/20 rounded-full transition-colors"><Settings size={18} /></button>
                  <button className="p-2 hover:bg-white/20 rounded-full transition-colors"><Maximize size={18} /></button>
                </div> */}
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

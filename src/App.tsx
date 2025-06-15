"use client";
import { useState, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Play, Download, Search } from "lucide-react";
import VideoPlayer from "./components/player";
import { Link } from "react-router";

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

const App = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [streamUrl, setStreamUrl] = useState("");
  const [streamAudioUrl, setStreamAudioUrl] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [selectedAudioFormat, setSelectedAudioFormat] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [channnelUrl, setChannelUrl] = useState("");
  const [channnelInfo, setChannelInfo] = useState("");

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
      const url = await invoke<string>("get_proxy_url", {
        videoUrl: videoUrl,
        formatId: selectedFormat || null,
      });
      console.log(`Streaming URL: ${url}`);

      const audioUrl = await invoke<string>("get_proxy_url", {
        videoUrl: videoUrl,
        formatId: selectedAudioFormat || null,
      });
      setStreamAudioUrl(audioUrl);
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
                onChange={(e) => {
                  setSelectedFormat(e.target.value);

                  console.log(`Selected format: ${e.target.value}`);
                }}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {videoInfo.formats.map((format) => (
                  <option key={format.format_id} value={format.format_id}>
                    {format.format_id} {format.quality} ({format.ext})
                  </option>
                ))}
              </select>
            </div>
            {/* 音声フォーマット選択 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                音声フォーマットを選択:
              </label>
              <select
                value={selectedAudioFormat}
                onChange={(e) => {
                  setSelectedAudioFormat(e.target.value);
                  console.log(`Selected audio format: ${e.target.value}`);
                }}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {videoInfo.formats.map((format) => (
                  <option key={format.format_id} value={format.format_id}>
                    {format.format_id} {format.quality} ({format.ext})
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
          <>
            <VideoPlayer videoSrc={streamUrl} audioSrc={streamAudioUrl} />
          </>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
      <input
        type="text"
        value={channnelUrl}
        onChange={(e) => setChannelUrl(e.target.value)}
        placeholder="チャンネルのURLを入力してください"
        className="mt-4 px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            // チャンネルURLの処理をここに追加
            console.log(`チャンネルURL: ${channnelUrl}`);
          }
        }}
      />
      <button
        onClick={() => {
          // チャンネルURLの処理をここに追加
          const result = invoke<string>("dlp_get_video_info", {
            videoUrl: channnelUrl,
          });
          result
            .then((data) => {
              console.log(`動画情報: ${data}`);
            })
            .catch((err) => {
              setError(`動画取得エラー: ${err}`);
            });
        }}
        className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center gap-2"
      >
        <Search size={18} />
      </button>
      <Link
        to="/home"
        className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center gap-2"
      >
        ホーム
      </Link>
      <Link
        to="/invidious-test"
        className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center gap-2"
      >
        Invidiousテスト
      </Link>
    </div>
  );
};

export default App;

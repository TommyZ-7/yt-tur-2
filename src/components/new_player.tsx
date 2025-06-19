import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaCog,
} from "react-icons/fa";
import { invoke } from "@tauri-apps/api/core";
import { useState, useRef, useEffect, FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSettings } from "@/hooks/useSettings";

/**
 * LoadingOverlayコンポーネント
 * Framer Motionによるアニメーションを担当
 */
const LoadingOverlay = () => {
  // オーバーレイ全体（フェードイン/アウト）のバリアント
  const overlayVariants = {
    hidden: { opacity: 0, transition: { duration: 0.5 } },
    visible: { opacity: 0.5, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={overlayVariants}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 animate-gradient-bg"
    >
      {/* 1. シャインエフェクト */}
      <motion.div
        className="absolute top-0 h-full w-full skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: "-150%" }}
        animate={{ x: "150%" }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }}
      />

      {/* 2. SVGスピナー */}
      <motion.div
        className="w-16 h-16"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 50 50" className="w-full h-full">
          <motion.circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            // strokeDasharray と strokeDashoffset をアニメーションさせる
            initial={{
              strokeDasharray: "1, 200",
              strokeDashoffset: 0,
            }}
            animate={{
              strokeDasharray: ["1, 200", "89, 200", "89, 200"],
              strokeDashoffset: [0, -35, -124],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
};

interface VideoInfo {
  title: string;
  duration: string;
  url: string;
  formats: Formats[];
}

interface Formats {
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
  const streamUrl = await invoke<string>("dlp_get_stream_url", {
    videoUrl: url,
    formatId: format,
  });
  console.log(`Stream URL for format ${format}:`, streamUrl);
  return streamUrl;
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

interface NewPlayerProps {
  youtubeUrl: string;
  thumbnailUrl: string;
  videoTitle?: string;
  channelName?: string;
  channelId?: string;
}

const NewPlayer: FC<NewPlayerProps> = ({
  youtubeUrl,
  thumbnailUrl,
  videoTitle,
  channelName,
  channelId,
}) => {
  const [selectedVideoFormat, setSelectedVideoFormat] = useState<string | null>(
    null
  );
  const [selectedAudioFormat, setSelectedAudioFormat] = useState<string | null>(
    null
  );
  const [videoFormats, setVideoFormats] = useState<SettingVideoFormat[]>([]);
  const [audioFormats, setAudioFormats] = useState<SettingAudioFormat[]>([]);
  const [streamVideoUrl, setStreamVideoUrl] = useState("");
  const [streamAudioUrl, setStreamAudioUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const isDragging = false;
  const timeBackupRef = useRef<number>(0);
  const formatChangeRef = useRef<boolean>(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const LoadedRef = useRef(false);
  const refreshRefTimeBackUp = useRef<number>(0);

  const { addHistory } = useAppSettings();
  const historyRecordedRef = useRef(false);

  const hideControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isDragging) {
        setShowControls(false);
      }
    }, 3000);
  };

  const showControlsTemporary = () => {
    setShowControls(true);
    hideControlsTimeout();
  };

  const togglePlay = () => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video || !audio) return;

    if (isPlaying) {
      video.pause();
      audio.pause();
    } else {
      video.play();
      audio.play();
      if (formatChangeRef.current) {
        video.currentTime = timeBackupRef.current;
        audio.currentTime = timeBackupRef.current;
        formatChangeRef.current = false;
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const progressBar = e.currentTarget;

    if (!video || !audio || !duration) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;

    video.currentTime = newTime;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    const audio = audioRef.current;

    if (!audio) return;

    setVolume(newVolume);
    audio.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const player = playerRef.current;
    if (!player) return;

    if (!isFullscreen) {
      if (player.requestFullscreen) {
        player.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleQualityChange = async (
    type: "video" | "audio",
    formatId: string
  ) => {
    setIsLoading(true);
    setIsPlaying(false);
    setVideoLoading(true);
    setShowSettings(false);

    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;
    timeBackupRef.current = video.currentTime;
    formatChangeRef.current = true;
    console.log(`Changing quality for ${type} to format ID: ${formatId}`);
    console.log("Current time before change:", timeBackupRef.current);

    // 動画と音声を一時停止
    if (video) {
      video.pause();
    }
    if (audio) {
      audio.pause();
    }

    try {
      // 新しいストリーミングURLを取得（非同期処理を待つ）
      if (type === "video") {
        setSelectedVideoFormat(formatId);
        const newVideoUrl = await getStreamingUrl(youtubeUrl, formatId);
        setStreamVideoUrl(newVideoUrl);
      } else {
        setSelectedAudioFormat(formatId);
        const newAudioUrl = await getStreamingUrl(youtubeUrl, formatId);
        setStreamAudioUrl(newAudioUrl);
        video.play();
      }
    } catch (error) {
      console.error("ストリーミングURL取得エラー:", error);
      // エラー処理が必要に応じて追加
    } finally {
      setIsLoading(false);
      setIsPlaying(true); // 再生状態を復元
    }
  };

  const handleRefresh = () => {
    console.log("Refetching video formats and streaming URLs...");
    refreshRefTimeBackUp.current = videoRef.current?.currentTime || 0;
    setVideoFormats([]);
    setAudioFormats([]);
    setStreamVideoUrl("");
    setStreamAudioUrl("");
    setSelectedVideoFormat(null);
    setSelectedAudioFormat(null);
    setVideoLoading(true);
    setDuration(0);
    setIsMuted(false);
    setIsFullscreen(false);
    setShowControls(true);
    LoadedRef.current = false; // 再度初期化
    setRefetchTrigger((prev) => prev + 1);
    console.log("Player state reset for refetch.");
  };

  const recordToHistory = async () => {
    console.log("Recording video to history...");
    console.log("Video title:", videoTitle);
    console.log("Channel name:", channelName);
    console.log("Channel ID:", channelId);
    console.log("YouTube URL:", youtubeUrl);
    if (
      historyRecordedRef.current ||
      !videoTitle ||
      !channelName ||
      !channelId
    ) {
      return;
    }

    try {
      // 動画IDをURLから抽出
      const videoId = extractVideoIdFromUrl(youtubeUrl);
      if (!videoId) return;

      const historyData = {
        title: videoTitle,
        url: youtubeUrl,
        atId: channelId,
        channelName: channelName,
        timestamp: Date.now(),
      };

      await addHistory(historyData);
      historyRecordedRef.current = true;
      console.log("Video added to history:", historyData);
    } catch (error) {
      console.error("Failed to record history:", error);
    }
  };

  const extractVideoIdFromUrl = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  useEffect(() => {
    if (!youtubeUrl || historyRecordedRef.current) return;
    console.log("Recording video to history...");
    recordToHistory();
  }, [youtubeUrl, videoTitle, channelName, channelId]);

  useEffect(() => {
    const initializePlayer = async () => {
      if (!youtubeUrl) {
        setError("YouTubeのURLを入力してください");
        return;
      }

      setIsLoading(true);
      setVideoLoading(true);
      setError("");
      setStreamVideoUrl("");
      setStreamAudioUrl("");

      try {
        const formatsResult = await getVideoFormats(youtubeUrl);

        if (
          !formatsResult ||
          !formatsResult.videoFormats ||
          !formatsResult.audioFormats
        ) {
          throw new Error("フォーマット情報の取得に失敗しました");
        }

        const { videoFormats, audioFormats } = formatsResult;
        setVideoFormats(videoFormats);
        setAudioFormats(audioFormats);

        if (videoFormats.length === 0 || audioFormats.length === 0) {
          setError("動画または音声のフォーマットが見つかりませんでした");
          setVideoLoading(false);
          return;
        }

        const selectedVideo = videoFormats[0];
        const selectedAudio = audioFormats[0];

        if (!selectedVideo?.id || !selectedAudio?.id) {
          throw new Error("有効なフォーマットが見つかりません");
        }

        setSelectedVideoFormat(selectedVideo.id);
        setSelectedAudioFormat(selectedAudio.id);

        const videoStreamUrl = await getStreamingUrl(
          youtubeUrl,
          selectedVideo.id
        );
        const audioStreamUrl = await getStreamingUrl(
          youtubeUrl,
          selectedAudio.id
        );

        if (!videoStreamUrl || !audioStreamUrl) {
          throw new Error("ストリーミングURLの取得に失敗しました");
        }

        setStreamVideoUrl(videoStreamUrl);
        setStreamAudioUrl(audioStreamUrl);
        console.log("Streaming URLs set:", {
          videoStreamUrl,
          audioStreamUrl,
        });
      } catch (err) {
        console.error("エラーが発生:", err);
        setError(`エラー: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    const handleVideoEvents = () => {
      const video = videoRef.current;
      const audio = audioRef.current;

      if (!video || !audio) return;

      const syncAudioToVideo = () => {
        if (Math.abs(audio.currentTime - video.currentTime) > 0.1) {
          audio.currentTime = video.currentTime;
        }
      };

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
        syncAudioToVideo();
      };

      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        console.log("Video metadata loaded:", {
          duration: video.duration,
          currentTime: video.currentTime,
        });
      };

      const handleWaiting = () => {
        setVideoLoading(true);
        console.log("Video is waiting for data...");
        audio.pause();
      };

      const handlePlaying = () => {
        if (refreshRefTimeBackUp.current !== 0) {
          video.currentTime = refreshRefTimeBackUp.current;
          audio.currentTime = refreshRefTimeBackUp.current;
          refreshRefTimeBackUp.current = 0;
        }
        setVideoLoading(false);
        setIsLoading(false);
        if (formatChangeRef.current) {
          video.currentTime = timeBackupRef.current;
          audio.currentTime = timeBackupRef.current;
          formatChangeRef.current = false;
        }
        setIsPlaying(true);
        audio.play();
        syncAudioToVideo();
      };

      const handlePause = () => {
        setIsPlaying(false);
        audio.pause();
      };

      const handleSeeking = () => {
        audio.currentTime = video.currentTime;
        audio.pause();
      };

      const handleSeeked = () => {
        audio.currentTime = video.currentTime;
        if (!video.paused) {
          audio.play();
        }
      };
      const handleStall = () => {
        console.warn("Video stalled, trying to recover...");
      };

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("waiting", handleWaiting);
      video.addEventListener("playing", handlePlaying);
      video.addEventListener("pause", handlePause);
      video.addEventListener("seeking", handleSeeking);
      video.addEventListener("seeked", handleSeeked);
      video.addEventListener("stalled", handleStall);
    };

    if (youtubeUrl && !LoadedRef.current) {
      LoadedRef.current = true;
      initializePlayer();
      console.log("Player initialized with YouTube URL:", youtubeUrl);
      console.log("Player initialized with Thumbnail URL:", thumbnailUrl);
    }

    return handleVideoEvents();
  }, [youtubeUrl, refetchTrigger, videoTitle, channelName, channelId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.log("Video error:", e.currentTarget.error);

    if (e.currentTarget.error) {
      if (
        e.currentTarget.error.message ===
        "MEDIA_ELEMENT_ERROR: Empty src attribute"
      ) {
        return; // src属性が空の場合は無視
      }
      setError(`動画の再生に失敗しました: ${e.currentTarget.error.message}`);
      setVideoLoading(false);
    }
  };
  const handleAudioError = (
    e: React.SyntheticEvent<HTMLAudioElement, Event>
  ) => {
    console.log("Audio error:", e.currentTarget.error);
    if (e.currentTarget.error) {
      if (
        e.currentTarget.error.message ===
        "MEDIA_ELEMENT_ERROR: Empty src attribute"
      ) {
        return; // src属性が空の場合は無視
      }
      setError(`音声の再生に失敗しました: ${e.currentTarget.error.message}`);
      setVideoLoading(false);
    }
  };

  return (
    <div
      ref={playerRef}
      className={`relative bg-[url(${thumbnailUrl})] rounded-lg overflow-hidden shadow-2xl  ${
        isFullscreen ? "w-screen h-screen" : "w-full h-full"
      }`}
      onMouseMove={showControlsTemporary}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={
        videoLoading
          ? {
              background: `url(${thumbnailUrl}) 100% 100% / cover no-repeat`,
            }
          : {}
      }
    >
      {/* Loading Overlay */}

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-red-500 text-center p-4">
            <p className="text-lg">{error}</p>
            <button
              onClick={() => handleRefresh()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              再読み込み
            </button>
          </div>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        src={streamVideoUrl}
        className="w-full h-full object-contain"
        muted
        onDoubleClick={toggleFullscreen}
        onClick={togglePlay}
        autoPlay
        onError={handleError}
      />

      {/* Audio Element (Hidden) */}
      <audio ref={audioRef} src={streamAudioUrl} onError={handleAudioError} />

      {/* Video Loading Spinner */}
      {videoLoading && (
        <AnimatePresence>
          <LoadingOverlay />
        </AnimatePresence>
      )}

      {/* Play Button Overlay */}
      {!isPlaying && !isLoading && streamVideoUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-6 shadow-lg transition-all duration-200 transform hover:scale-110"
          >
            <FaPlay className="text-3xl ml-1" />
          </button>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress Bar */}
        <div className="px-4 pb-2">
          <div
            className="w-full h-1 bg-gray-600 rounded-full cursor-pointer hover:h-2 transition-all duration-150"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-red-600 rounded-full relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-150" />
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between px-4 pb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-red-400 transition-colors duration-200"
            >
              {isPlaying ? (
                <FaPause className="text-xl" />
              ) : (
                <FaPlay className="text-xl" />
              )}
            </button>

            <div className="flex items-center space-x-2 group">
              <button
                onClick={toggleMute}
                className="text-white hover:text-red-400 transition-colors duration-200"
              >
                {isMuted ? (
                  <FaVolumeMute className="text-lg" />
                ) : (
                  <FaVolumeUp className="text-lg" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${
                    (isMuted ? 0 : volume) * 100
                  }%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`,
                }}
              />
            </div>

            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Settings Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-red-400 transition-colors duration-200"
              >
                <FaCog className="text-lg" />
              </button>

              {showSettings && (
                <div className="absolute grid grid-cols-2 bottom-8 right-0 bg-black bg-opacity-90 rounded-lg p-3 min-w-64">
                  <div>
                    <div className="text-white text-sm mb-2">画質</div>
                    {videoFormats.map((format) => (
                      <button
                        key={format.id}
                        onClick={() => {
                          setVideoLoading(true);
                          handleQualityChange("video", format.id);
                        }}
                        className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-700 transition-colors duration-150 ${
                          selectedVideoFormat === format.id
                            ? "text-red-400"
                            : "text-white"
                        }`}
                      >
                        {format.quality} ({format.codec})
                      </button>
                    ))}
                  </div>
                  <div>
                    <div className="text-white text-sm mb-2">音質</div>
                    {audioFormats.map((format) => (
                      <button
                        key={format.id}
                        onClick={() => {
                          setVideoLoading(true);
                          handleQualityChange("audio", format.id);
                        }}
                        className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-700 transition-colors duration-150 ${
                          selectedAudioFormat === format.id
                            ? "text-red-400"
                            : "text-white"
                        }`}
                      >
                        {format.quality} ({format.codec})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-red-400 transition-colors duration-200"
            >
              {isFullscreen ? (
                <FaCompress className="text-lg" />
              ) : (
                <FaExpand className="text-lg" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPlayer;

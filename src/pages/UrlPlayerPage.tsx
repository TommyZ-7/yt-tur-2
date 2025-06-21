import { FC, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Calendar } from "lucide-react";
import { UrlPlayerProps } from "@/types";
import { formatNumberWithSlashes, extractChannelIdFromUrl } from "@/lib/utils";
import { apiService } from "@/services/api";
import NewPlayer from "@/components/new_player";

export const UrlPlayerPage: FC<{ directUrl?: string }> = ({ directUrl }) => {
  const [url, setUrl] = useState<string>(directUrl || "");
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [videoInfo, setVideoInfo] = useState<UrlPlayerProps | null>(null);

  const handlePlay = async () => {
    if (!url) return;
    setVideoLoaded(true);

    try {
      const parsedResult = await apiService.getVideoInfo(url);
      console.log("Parsed Video Info:", parsedResult);
      setVideoInfo({
        title: parsedResult.title,
        views: parsedResult.view_count,
        date: parsedResult.upload_date,
        likes: parsedResult.like_count,
        subscribers: parsedResult.follower,
        channelUrl: parsedResult.channel_url,
      });

      // チャンネル情報を取得（チャンネルURLから@IDを抽出）
      const channelId = extractChannelIdFromUrl(parsedResult.channel_url);
      if (channelId) {
        const channelInfo = await apiService.getChannelInfo(channelId);
        setVideoInfo((prev) => ({
          ...prev,
          name: channelInfo.name,
          icon: channelInfo.icon,
          channelId: channelId || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching video info:", error);
    }
  };

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">URLから動画を再生</h2>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="動画のURLを入力"
        className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
      />
      <button
        onClick={handlePlay}
        className="mt-4 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-semibold transition-colors"
      >
        再生
      </button>
      <button
        onClick={() => {
          console.log(videoInfo);
        }}
        className="mt-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold transition-colors"
      >
        動画情報取得
      </button>
      {videoLoaded && (
        <div className="mt-6">
          <NewPlayer
            youtubeUrl={url}
            thumbnailUrl=""
            videoTitle={videoInfo?.title}
            channelName={videoInfo?.name}
            channelId={
              extractChannelIdFromUrl(videoInfo?.channelUrl || "") || ""
            }
          />
          <motion.h1
            className="text-3xl font-bold text-white mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {videoInfo?.title}
          </motion.h1>
          <motion.div
            className="flex items-center justify-between text-neutral-400 mt-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Eye size={16} />
                <span>{videoInfo?.views}回視聴</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={16} />
                <span>
                  {formatNumberWithSlashes(videoInfo?.date || "00000000")}
                </span>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="flex items-center gap-4 mt-6 py-4 border-y border-neutral-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <img
              src={videoInfo?.icon}
              alt={videoInfo?.name}
              className="w-12 h-12 rounded-full cursor-pointer"
            />
            <div>
              <h3 className="font-bold text-white text-lg cursor-pointer hover:text-red-400 transition-colors">
                {videoInfo?.name}
              </h3>
              <p className="text-sm text-neutral-400">
                {videoInfo?.subscribers}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

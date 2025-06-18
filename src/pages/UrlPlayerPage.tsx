import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Calendar } from "lucide-react";
import { UrlPlayerProps } from "@/types";
import { formatNumberWithSlashes } from "@/lib/utils";
import { apiService } from "@/services/api";
import NewPlayer from "@/components/new_player";

export const UrlPlayerPage = () => {
  const [url, setUrl] = useState<string>("");
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [videoInfo, setVideoInfo] = useState<UrlPlayerProps | null>(null);

  const handlePlay = async () => {
    if (!url) return;
    setVideoLoaded(true);

    try {
      const parsedResult = await apiService.getVideoInfo(url);
      setVideoInfo({
        title: parsedResult.title,
        views: parsedResult.view_count,
        date: parsedResult.upload_date,
        likes: parsedResult.like_count,
        subscribers: parsedResult.follower,
        channelUrl: parsedResult.channel_url,
      });

      const channelInfo = await apiService.getChannelInfo(
        parsedResult.channel_url
      );
      setVideoInfo((prev) => ({
        ...prev,
        name: channelInfo.name,
        icon: channelInfo.icon,
      }));
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
      {videoLoaded && (
        <div className="mt-6">
          <NewPlayer youtubeUrl={url} thumbnailUrl="" />
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

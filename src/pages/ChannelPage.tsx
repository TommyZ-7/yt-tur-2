import React, { FC, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, Loader } from "lucide-react";
import { DetailPageProps, Video, NavigateFunction } from "@/types";
import {
  pageVariants,
  pageTransition,
  listVariants,
} from "@/config/animations";
import { VideoCard } from "@/components/cards/VideoCard";
import { apiService } from "@/services/api";

export const ChannelPage: FC<DetailPageProps> = ({
  id,
  navigate,
  channels,
  handleUpdateChannelList,
}) => {
  const channel = useMemo(
    () => channels.find((c) => c.id === id),
    [id, channels]
  );
  const [videoLoading, setVideoLoading] = useState<boolean>(false);

  if (!channel) return <div>Channel not found</div>;

  const handleLoadMoreVideos = async () => {
    setVideoLoading(true);
    try {
      const newVideos = await apiService.getChannelMoreVideos(
        channel.atId,
        channel.fetchCount || 0
      );
      handleUpdateChannelList(newVideos, (channel.fetchCount || 8) + 6);
    } catch (error) {
      console.error("Error loading more videos:", error);
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <motion.div
      key={`channel-${id}`}
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={pageTransition}
    >
      <div className="relative h-60 md:h-80 rounded-2xl overflow-hidden -mx-4 md:-mx-8 -mt-4 shadow-2xl">
        <motion.img
          src={channel.banner}
          alt={`${channel.name} banner`}
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent"></div>
      </div>
      <div className="flex flex-col md:flex-row items-center md:items-end -mt-20 md:-mt-24 px-4 md:px-8 z-10 relative">
        <motion.img
          src={channel.icon}
          alt={`${channel.name} icon`}
          className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-neutral-900 bg-neutral-800 shadow-2xl"
          layoutId={`channel-icon-${id}`}
        />
        <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {channel.name}
          </motion.h1>
          <motion.div
            className="text-neutral-400 mt-2 flex items-center justify-center md:justify-start gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>{channel.subscribers}</span>
            </div>
            <span>•</span>
            <div>{channel.videos?.length || 0}本の動画</div>
          </motion.div>
        </div>
      </div>
      <motion.p
        className="mt-8 text-neutral-300 max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {channel.description}
      </motion.p>
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">動画一覧</h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {channel.videos?.map((video) => (
            <VideoCard key={video.id} video={video} navigate={navigate} />
          ))}
          {videoLoading && (
            <div className="col-span-full text-center relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader size={24} className="text-red-500 animate-spin" />
              </div>
            </div>
          )}
          {!videoLoading && (
            <button className="col-span-full" onClick={handleLoadMoreVideos}>
              <div className="flex items-center justify-center h-12 bg-neutral-800/50 rounded-lg cursor-pointer hover:bg-neutral-700 transition-colors">
                <span className="text-white font-semibold">
                  さらに動画を読み込む
                </span>
              </div>
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

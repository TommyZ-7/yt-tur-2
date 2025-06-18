import { FC, useMemo } from "react";
import { motion } from "framer-motion";
import { Eye, Calendar } from "lucide-react";
import { DetailPageProps } from "@/types";
import { pageVariants, pageTransition } from "@/config/animations";
import { formatNumberWithSlashes } from "@/lib/utils";
import NewPlayer from "@/components/new_player";

export const VideoPage: FC<DetailPageProps> = ({ id, navigate, channels }) => {
  const videoInfo = useMemo(() => {
    for (const channel of channels) {
      const video = channel.videos?.find((v) => v.id === id);
      if (video) return { video, channel };
    }
    return null;
  }, [id, channels]);

  if (!videoInfo) return <div>Video not found</div>;
  const { video, channel } = videoInfo;
  const relatedVideos = channel.videos?.filter((v) => v.id !== id) || [];

  return (
    <motion.div
      key={`video-${id}`}
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={pageTransition}
      className="grid grid-cols-1 lg:grid-cols-4 gap-8"
    >
      <div className="lg:col-span-3">
        <motion.div
          layoutId={`video-player-${video.id}`}
          className="aspect-video bg-black rounded-2xl shadow-2xl overflow-hidden"
        >
          <NewPlayer
            youtubeUrl={video.url}
            thumbnailUrl={video.thumbnail || ""}
          />
        </motion.div>
        <motion.h1
          className="text-3xl font-bold text-white mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {video.title}
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
              <span>{video.views}回視聴</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={16} />
              <span>{formatNumberWithSlashes(video.date || "00000000")}</span>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="flex items-center gap-4 mt-6 py-4 border-y border-neutral-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.img
            layoutId={`channel-icon-${channel.id}`}
            src={channel.icon}
            alt={channel.name}
            className="w-12 h-12 rounded-full cursor-pointer"
            onClick={() => navigate({ name: "channel", id: channel.id })}
          />
          <div>
            <h3
              className="font-bold text-white text-lg cursor-pointer hover:text-red-400 transition-colors"
              onClick={() => navigate({ name: "channel", id: channel.id })}
            >
              {channel.name}
            </h3>
            <p className="text-sm text-neutral-400">{channel.subscribers}</p>
          </div>
        </motion.div>
      </div>
      <motion.div
        className="lg:col-span-1"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-bold text-white mb-4">関連動画</h2>
        <div className="space-y-4">
          {relatedVideos.map((rv) => (
            <div
              key={rv.id}
              className="flex gap-4 group cursor-pointer"
              onClick={() => navigate({ name: "video", id: rv.id ?? null })}
            >
              <motion.div
                className="w-40 rounded-lg overflow-hidden flex-shrink-0"
                layoutId={`video-player-${rv.id}`}
              >
                <img
                  src={rv.thumbnail}
                  alt={rv.title}
                  className="w-full h-24 object-cover"
                />
              </motion.div>
              <div>
                <h4 className="font-semibold text-white leading-tight group-hover:text-red-400 transition-colors line-clamp-2">
                  {rv.title}
                </h4>
                <p className="text-sm text-neutral-400 mt-1">{channel.name}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {rv.views}回視聴 •{" "}
                  {formatNumberWithSlashes(rv.date || "00000000")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

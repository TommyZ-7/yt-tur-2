import { FC } from "react";
import { motion } from "framer-motion";
import { PlayCircle, Eye, Calendar } from "lucide-react";
import { Video, NavigateFunction } from "@/types";
import { itemVariants } from "@/config/animations";
import { formatNumberWithSlashes } from "@/lib/utils";

interface VideoCardProps {
  video: Video;
  navigate: NavigateFunction;
}

export const VideoCard: FC<VideoCardProps> = ({ video, navigate }) => (
  <motion.div
    variants={itemVariants}
    className="cursor-pointer group"
    onClick={() => navigate({ name: "video", id: video.id ?? null })}
  >
    <motion.div
      layoutId={`video-player-${video.id}`}
      className="relative rounded-xl overflow-hidden shadow-lg"
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <img
        src={video.thumbnail}
        alt={video.title}
        className="w-full aspect-video object-cover"
      />
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <PlayCircle
          size={60}
          className="text-white/80 transform group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        12:34
      </span>
    </motion.div>
    <div className="mt-3">
      <h3 className="font-semibold text-white truncate">{video.title}</h3>
      <div className="text-sm text-neutral-400 flex items-center gap-4 mt-1">
        <div className="flex items-center gap-1.5">
          <Eye size={14} />
          <span>{video.views}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={14} />
          <span>{formatNumberWithSlashes(video.date || "00000000")}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

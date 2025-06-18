import { FC } from "react";
import { motion } from "framer-motion";
import { PlayCircle, Users } from "lucide-react";
import { Channel, NavigateFunction } from "@/types";
import { itemVariants } from "@/config/animations";

interface ChannelCardProps {
  channel: Channel;
  navigate: NavigateFunction;
}

export const ChannelCard: FC<ChannelCardProps> = ({ channel, navigate }) => {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-neutral-800/50 rounded-2xl overflow-hidden shadow-lg border border-neutral-700/50"
    >
      <div className="h-32 md:h-40 relative">
        <img
          src={channel.banner}
          alt={`${channel.name} banner`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-800/80 to-transparent"></div>
        <motion.img
          layoutId={`channel-icon-${channel.id}`}
          src={channel.icon}
          alt={`${channel.name} icon`}
          className="absolute bottom-[-40px] left-6 w-20 h-20 rounded-full border-4 border-neutral-800 shadow-xl"
        />
      </div>
      <div className="p-6 pt-14">
        <h2
          className="text-2xl font-bold text-white cursor-pointer hover:text-red-400 transition-colors"
          onClick={() => navigate({ name: "channel", id: channel.id })}
        >
          {channel.name}
        </h2>
        <div className="flex items-center gap-2 text-neutral-400 text-sm mt-1">
          <Users size={16} />
          <span>{channel.subscribers}</span>
        </div>
        <p className="text-neutral-300 mt-3 text-sm h-10 overflow-hidden">
          {channel.description}
        </p>
      </div>
      <div className="px-6 pb-6">
        <h3 className="font-semibold text-white mb-3">最新の動画</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {channel.videos?.slice(0, 3).map((video) => (
            <div
              key={video.id}
              className="group cursor-pointer"
              onClick={() => navigate({ name: "video", id: video.id ?? null })}
            >
              <motion.div
                className="relative rounded-lg overflow-hidden"
                layoutId={`video-player-${video.id}`}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PlayCircle size={40} className="text-white/80" />
                </div>
              </motion.div>
              <h4 className="text-xs text-white mt-2 font-medium truncate">
                {video.title}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

import React, { FC, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Channel, NavigateFunction, PageProps } from "@/types";
import { pageVariants, pageTransition, listVariants, itemVariants } from "@/config/animations";

interface SubscriptionChannelItemProps {
  channel: Channel;
  navigate: NavigateFunction;
}

const SubscriptionChannelItem: FC<SubscriptionChannelItemProps> = ({
  channel,
  navigate,
}) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      variants={itemVariants}
      className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group shadow-lg"
      onClick={() => navigate({ name: "channel", id: channel.id })}
    >
      <motion.img
        src={channel.banner}
        alt={`${channel.name} banner`}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-300"></div>
      <div className="relative h-full flex flex-col items-center justify-center p-4">
        <motion.img
          layoutId={`channel-icon-${channel.id}`}
          src={channel.icon}
          alt={`${channel.name} icon`}
          layout="position"
          initial={false}
          transition={{
            duration: isInitialLoad ? 0 : 0.3,
            ease: "easeInOut",
          }}
          className="w-16 h-16 rounded-full border-2 border-white/50 shadow-xl transition-transform duration-300 group-hover:scale-110"
        />
        <h3 className="mt-3 text-white font-bold text-lg text-center drop-shadow-md">
          {channel.name}
        </h3>
      </div>
    </motion.div>
  );
};

export const SubscriptionsPage: FC<PageProps> = ({ navigate, channels }) => (
  <motion.div
    key="subscriptions"
    variants={pageVariants}
    initial="initial"
    animate="in"
    exit="out"
    transition={pageTransition}
  >
    <h1 className="text-4xl font-bold text-white mb-8">登録チャンネル</h1>
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
      variants={listVariants}
      initial="hidden"
      animate="visible"
    >
      {channels.length > 0 ? (
        channels.map((channel) => (
          <SubscriptionChannelItem
            key={channel.id}
            channel={channel}
            navigate={navigate}
          />
        ))
      ) : (
        <p className="text-neutral-400 col-span-full">
          登録チャンネルはありません。
        </p>
      )}
    </motion.div>
  </motion.div>
);
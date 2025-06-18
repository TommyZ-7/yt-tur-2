import { FC } from "react";
import { motion, Transition } from "framer-motion";
import { PageProps } from "@/types";
import {
  pageVariants,
  pageTransition,
  listVariants,
} from "@/config/animations";
import { ChannelCard } from "@/components/cards/ChannelCard";

export const HomePage: FC<PageProps> = ({ navigate, channels }) => (
  <motion.div
    key="home"
    variants={pageVariants}
    initial="initial"
    animate="in"
    exit="out"
    transition={pageTransition as Transition}
  >
    <h1 className="text-4xl font-bold text-white mb-8">人気のチャンネル</h1>
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      variants={listVariants}
      initial="hidden"
      animate="visible"
    >
      {channels.map((channel) => (
        <ChannelCard key={channel.id} channel={channel} navigate={navigate} />
      ))}
    </motion.div>
  </motion.div>
);

import React, { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Youtube,
  ListVideo,
  Menu,
  PlayCircle,
  Users,
} from "lucide-react";
import { NavigateFunction, PageState } from "@/types";
import { sidebarVariants, navItemVariants } from "@/config/animations";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  navigate: NavigateFunction;
}

export const Sidebar: FC<SidebarProps> = ({ isOpen, setIsOpen, navigate }) => {
  const navItems = [
    {
      icon: Home,
      label: "ホーム",
      page: { name: "home", id: null } as PageState,
    },
    {
      icon: Youtube,
      label: "登録チャンネル",
      page: { name: "channelList", id: null } as PageState,
    },
    {
      icon: ListVideo,
      label: "マイリスト",
      page: { name: "playlist", id: null } as PageState,
    },
    {
      icon: Users,
      label: "視聴履歴",
      page: { name: "history", id: null } as PageState,
    },
    {
      icon: Menu,
      label: "プレイヤー",
      page: { name: "player", id: null } as PageState,
    },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 z-40"
          />
        )}
      </AnimatePresence>
      <motion.nav
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-full bg-neutral-900/80 backdrop-blur-md w-64 z-50 p-6 shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-10">
          <PlayCircle className="text-red-500" size={30} />
          <h1 className="text-xl font-bold text-white">VideoHub</h1>
        </div>
        <motion.ul
          className="space-y-2"
          initial="initial"
          animate={isOpen ? "animate" : "initial"}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
        >
          {navItems.map((item, index) => (
            <motion.li key={index} variants={navItemVariants}>
              <a
                href="#"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  navigate(item.page);
                  setIsOpen(false);
                }}
                className="flex items-center gap-4 p-3 rounded-lg text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors duration-200"
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </a>
            </motion.li>
          ))}
        </motion.ul>
      </motion.nav>
    </>
  );
};
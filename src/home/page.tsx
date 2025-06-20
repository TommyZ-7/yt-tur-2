import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Loader, Settings } from "lucide-react";
import "@/App.css";
import { PageState, NavigateFunction } from "@/types";
import { Sidebar } from "@/components/layout/Sidebar";
import { HomePage } from "@/pages/HomePage";
import { ChannelPage } from "@/pages/ChannelPage";
import { VideoPage } from "@/pages/VideoPage";
import { SubscriptionsPage } from "@/pages/SubscriptionsPage";
import { UrlPlayerPage } from "@/pages/UrlPlayerPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { useChannels } from "@/hooks/useChannels";

export default function App() {
  const [page, setPage] = useState<PageState>({ name: "home", id: null });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const { channelList, handleUpdateChannelList } = useChannels();
  const isLoading = false;

  const navigate: NavigateFunction = (newPage) => {
    if (newPage.name === page.name && newPage.id === page.id) return;
    console.log("Navigating to:", newPage);
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ ease: "linear", duration: 1, repeat: Infinity }}
          >
            <Loader size={48} className="text-red-500" />
          </motion.div>
        </div>
      );
    }

    switch (page.name) {
      case "channel":
        return (
          <ChannelPage
            id={page.id!}
            navigate={navigate}
            channels={channelList}
            handleUpdateChannelList={(newVideos, fetchCount) =>
              handleUpdateChannelList(newVideos, fetchCount, page.id!)
            }
          />
        );
      case "video":
        return (
          <VideoPage
            id={page.id!}
            navigate={navigate}
            channels={channelList}
            handleUpdateChannelList={(newVideos, fetchCount) =>
              handleUpdateChannelList(newVideos, fetchCount, page.id!)
            }
          />
        );
      case "channelList":
        return <SubscriptionsPage navigate={navigate} channels={channelList} />;
      case "playlist":
        return (
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">マイリスト</h2>
            <p>この機能はまだ実装されていません。</p>
          </div>
        );
      case "history":
        return <HistoryPage navigate={navigate} />;
      case "player":
        return <UrlPlayerPage directUrl={page.id || ""} />;
      case "settings":
        return <SettingsPage />;
      case "home":
      default:
        return <HomePage navigate={navigate} channels={channelList} />;
    }
  };

  return (
    <div className="bg-neutral-900 min-h-screen font-sans text-white overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        navigate={navigate}
      />
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 bg-neutral-800/50 p-3 rounded-full text-white hover:bg-neutral-700 transition-colors backdrop-blur-sm"
      >
        <Menu size={24} />
      </button>
      <main
        className={`transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-64" : "translate-x-0"
        }`}
      >
        <div className="mx-auto px-4 md:px-8 py-8">
          <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
        </div>
      </main>
    </div>
  );
}

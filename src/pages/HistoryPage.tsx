import { FC } from "react";
import { motion } from "framer-motion";
import { Trash2, Play } from "lucide-react";
import { NavigateFunction } from "@/types";
import {
  pageVariants,
  pageTransition,
  listVariants,
  itemVariants,
} from "@/config/animations";
import { useSettings } from "@/contexts/SettingsContext";

interface HistoryPageProps {
  navigate: NavigateFunction;
}

export const HistoryPage: FC<HistoryPageProps> = ({ navigate }) => {
  const { appSettings, removeHistory, clearHistory } = useSettings();

  const historyEntries = Object.entries(appSettings.history).sort(
    (a, b) => b[1].timestamp - a[1].timestamp
  );

  const handlePlayVideo = (
    _videoId: string,
    videoData: (typeof appSettings.history)[0]
  ) => {
    // URLプレイヤーページに遷移して動画を再生
    navigate({ name: "player", id: videoData.url });
    // または直接動画ページに遷移する場合
    // navigate({ name: "video", id: videoId });
  };

  const handleRemoveHistory = async (videoId: string) => {
    const index = appSettings.history.findIndex(
      (item, idx) => historyEntries[idx] && historyEntries[idx][0] === videoId
    );
    if (index !== -1) {
      await removeHistory(index);
    }
  };

  const handleClearAllHistory = async () => {
    if (window.confirm("すべての履歴を削除しますか？")) {
      await clearHistory();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `今日 ${date.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays === 1) {
      return `昨日 ${date.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return date.toLocaleDateString("ja-JP");
    }
  };

  return (
    <motion.div
      key="history"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={pageTransition}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">視聴履歴</h1>
        {historyEntries.length > 0 && (
          <button
            onClick={handleClearAllHistory}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
          >
            <Trash2 size={16} />
            すべて削除
          </button>
        )}
      </div>

      {historyEntries.length === 0 ? (
        <div className="text-center text-neutral-400 py-12">
          <p className="text-lg">視聴履歴はありません</p>
          <p className="text-sm mt-2">
            動画を視聴すると、ここに履歴が表示されます
          </p>
        </div>
      ) : (
        <motion.div
          className="space-y-4"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {historyEntries.map(([videoId, videoData]) => (
            <motion.div
              key={videoId}
              variants={itemVariants}
              className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50 hover:bg-neutral-800/70 transition-colors group"
            >
              <div className="flex gap-4">
                <div
                  className="flex-shrink-0 cursor-pointer relative group/play"
                  onClick={() => handlePlayVideo(videoId, videoData)}
                >
                  <div className="w-48 h-28 bg-neutral-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <Play
                      size={24}
                      className="text-neutral-400 group-hover/play:text-white transition-colors"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/play:opacity-100 transition-opacity flex items-center justify-center">
                      <Play size={32} className="text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className="text-white font-semibold text-lg leading-tight mb-2 cursor-pointer hover:text-red-400 transition-colors line-clamp-2"
                    onClick={() => handlePlayVideo(videoId, videoData)}
                  >
                    {videoData.title}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-neutral-400 mb-2">
                    <span className="hover:text-white transition-colors cursor-pointer">
                      {videoData.channelName}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span>{formatDate(videoData.timestamp)}</span>
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-start">
                  <button
                    onClick={() => handleRemoveHistory(videoId)}
                    className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

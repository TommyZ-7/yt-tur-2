import { FC, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PlusCircle,
  Trash2,
  Monitor,
  Settings,
  Film,
  Volume2,
  Moon,
  Globe,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import {
  pageVariants,
  pageTransition,
  itemVariants,
} from "@/config/animations";
import { useSettings } from "@/contexts/SettingsContext";
import { AnimatePresence, Reorder } from "framer-motion";

interface channels {
  id: string;
  channelName: string;
}

export const SettingsPage: FC = () => {
  // 設定項目用のState
  const { appSettings, editVolume, updateSettings } = useSettings();
  const [newChannelUrl, setNewChannelUrl] = useState("");
  const [channels, setChannels] = useState<channels[]>(
    appSettings.followChannel
  );

  const addChannel = () => {
    if (!newChannelUrl.trim()) return;
    // 本来はここでチャンネル情報を取得する
    console.log("Adding channel:", newChannelUrl);
    // ダミーとして追加
    const dummyNewChannel = {
      id: `@${newChannelUrl.split("/").pop()}`,
      name: newChannelUrl,
      icon: "https://placehold.co/100x100/CCCCCC/FFFFFF?text=N",
      banner: "https://placehold.co/1600x400/9E9E9E/FFFFFF?text=New+Channel",
      description: "新しいチャンネルの説明です。",
      subscribers: "0",
      videos: [],
    };
    setChannels((prev) => [...prev, dummyNewChannel]);
    setNewChannelUrl("");
  };

  const removeChannel = (channelId: string) => {
    setChannels((prev) => prev.filter((c) => c.id !== channelId));
  };

  const browsers = [
    "brave",
    "chrome",
    "chromium",
    "edge",
    "firefox",
    "opera",
    "safari",
    "vivaldi",
  ];
  const settingSections = [
    { id: "channels", label: "チャンネル", icon: Monitor },
    { id: "quality", label: "品質", icon: Film },
    { id: "app", label: "アプリ", icon: Settings },
    { id: "privacy", label: "プライバシー", icon: Globe },
  ];

  return (
    <motion.div
      key="settings"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={pageTransition}
    >
      <h1 className="text-4xl font-bold text-white mb-8">設定</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* 左側のナビゲーション */}
        <aside className="md:col-span-1">
          <ul className="space-y-2 sticky top-8">
            {settingSections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  <section.icon size={20} />
                  <span>{section.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* 右側の設定コンテンツ */}
        <main className="md:col-span-3 space-y-12">
          <section id="channels">
            <h2 className="text-2xl font-bold text-white mb-1 border-b border-neutral-700 pb-2">
              チャンネル管理
            </h2>
            <p className="text-neutral-400 mb-6">
              登録しているチャンネルの追加と削除を行います。
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newChannelUrl}
                onChange={(e) => setNewChannelUrl(e.target.value)}
                placeholder="YouTubeチャンネルのURLまたはID..."
                className="flex-grow bg-neutral-700 text-white placeholder-neutral-400 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={addChannel}
                className="bg-red-600 hover:bg-red-700 text-white font-bold p-2 rounded-lg transition-colors"
              >
                <PlusCircle />
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto pr-2">
              <Reorder.Group
                as="ul"
                axis="y"
                values={channels}
                onReorder={setChannels}
                className="space-y-2"
              >
                {channels.map((channel) => (
                  <Reorder.Item
                    key={channel.id}
                    value={channel}
                    as="li"
                    className="flex items-center bg-neutral-800/50 p-2 rounded-lg"
                  >
                    <div className="text-neutral-400 cursor-grab mr-3">
                      <GripVertical size={20} />
                    </div>
                    <img
                      src={channel.icon}
                      alt={channel.name}
                      className="w-10 h-10 rounded-full mr-4"
                    />
                    <span className="text-white font-medium flex-grow truncate">
                      {channel.name}
                    </span>
                    <button
                      onClick={() => removeChannel(channel.id)}
                      className="text-neutral-400 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </section>

          <section id="quality">
            <h2 className="text-2xl font-bold text-white mb-1 border-b border-neutral-700 pb-2">
              品質設定
            </h2>
            <p className="text-neutral-400 mb-6">
              動画再生時の品質に関する設定です。
            </p>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white">優先解像度</h3>
                <p className="text-neutral-400 text-sm mb-3">
                  再生する動画のデフォルト解像度を選択します。
                </p>
                <SettingSelect
                  value={appSettings.settings.resolution}
                  options={["2160p", "1440p", "1080p", "720p", "480p", "360p"]}
                  onChange={(value) =>
                    updateSettings({
                      resolution: value as
                        | "2160p"
                        | "1440p"
                        | "1080p"
                        | "720p"
                        | "480p"
                        | "360p",
                    })
                  }
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  優先コーデック
                </h3>
                <p className="text-neutral-400 text-sm mb-3">
                  対応している場合に優先して使用する映像コーデックです。
                </p>
                <SettingSelect
                  value={appSettings.settings.codecs}
                  options={["av1", "vp9", "h264"]}
                  onChange={(value) =>
                    updateSettings({ codecs: value as "av1" | "vp9" | "h264" })
                  }
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">優先音質</h3>
                <p className="text-neutral-400 text-sm mb-3">
                  音声の品質を選択します。
                </p>
                <SettingSelect
                  value={appSettings.settings.audioQuality}
                  options={["high", "medium", "low"]}
                  onChange={(value) =>
                    updateSettings({
                      audioQuality: value as "high" | "medium" | "low",
                    })
                  }
                />
              </div>
            </div>
          </section>

          <section id="app">
            <h2 className="text-2xl font-bold text-white mb-1 border-b border-neutral-700 pb-2">
              アプリケーション設定
            </h2>
            <p className="text-neutral-400 mb-6">
              アプリの動作や外観に関する設定です。
            </p>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white">音量</h3>
                <p className="text-neutral-400 text-sm mb-3">
                  全体の音量を調整します。
                </p>
                <div className="flex items-center gap-4">
                  <Volume2 />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={appSettings.settings.volume}
                    onChange={(e) => editVolume(parseFloat(e.target.value))}
                    className="w-full accent-red-500"
                  />
                  <span className="w-10 text-center">
                    {appSettings.settings.volume}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">言語</h3>
                <p className="text-neutral-400 text-sm mb-3">
                  UIの表示言語を選択します。
                </p>
                <SettingSelect
                  value={appSettings.settings.language}
                  options={["ja", "en"]}
                  onChange={(value) =>
                    updateSettings({ language: value as "ja" | "en" })
                  }
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">外観</h3>
                <p className="text-neutral-400 text-sm mb-3">
                  ライトモードとダークモードを切り替えます。
                </p>
                <div className="flex items-center gap-4 p-3 bg-neutral-800/50 rounded-lg">
                  <Moon />
                  <span className="flex-grow">ダークモード</span>
                  <button
                    onClick={() =>
                      updateSettings({
                        theme:
                          appSettings.settings.theme === "dark"
                            ? "light"
                            : "dark",
                      })
                    }
                    className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                      appSettings.settings.theme === "dark"
                        ? "bg-red-600 justify-end"
                        : "bg-neutral-600 justify-start"
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-5 h-5 bg-white rounded-full m-0.5"
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section id="privacy">
            <h2 className="text-2xl font-bold text-white mb-1 border-b border-neutral-700 pb-2">
              プライバシー
            </h2>
            <p className="text-neutral-400 mb-6">
              ログイン情報を取得するためのブラウザを選択します。
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
              {browsers.map((browser) => (
                <button
                  key={browser}
                  onClick={() =>
                    updateSettings({
                      cookie: browser as
                        | "brave"
                        | "chrome"
                        | "chromium"
                        | "edge"
                        | "firefox"
                        | "safari"
                        | "opera"
                        | "vivaldi",
                    })
                  }
                  className={`p-4 rounded-lg flex flex-col items-center justify-center transition-all duration-200 border-2 ${
                    appSettings.settings.cookie === browser
                      ? "border-red-500 bg-red-600/20"
                      : "border-transparent bg-neutral-800/50 hover:bg-neutral-700"
                  }`}
                >
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${browser}.com&sz=64`}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/64x64/333333/FFFFFF?text=B";
                    }}
                    alt={browser}
                    className="w-8 h-8 mb-2 rounded-md"
                  />
                  <span className="text-xs font-medium capitalize">
                    {browser}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </motion.div>
  );
};

const SettingSelect: FC<{
  options: string[];
  value: string;
  onChange: (value: string) => void;
}> = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));
  return (
    <div className="relative w-full md:w-60" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-neutral-700/50 px-4 py-2 rounded-lg text-white hover:bg-neutral-700 transition-colors"
      >
        <span>{value}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown size={18} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 top-full mt-2 w-full bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg overflow-hidden"
          >
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 transition-colors ${
                  value === option
                    ? "bg-red-600/50 text-white"
                    : "hover:bg-neutral-700"
                }`}
              >
                {option}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- 設定ページ関連コンポーネント ---
const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

import { Link } from "react-router";
import React, { useState, useEffect, FC, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reorder } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Download,
  Settings,
  Users,
  Globe,
  HardDrive,
  PlusCircle,
  Trash2,
  GripVertical,
  ChevronDown,
} from "lucide-react";
import { SpinnerLoader } from "@/components/animationIcon/spiner";
import { useSettings } from "@/contexts/SettingsContext";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { emitter } from "@/types";

// --- 型定義 (TypeScript) ---
interface StepProps {
  nextStep: () => void;
  prevStep: () => void;
}

// --- Framer MotionのAnimation設定 ---
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

// --- ヘッダーコンポーネント ---
const SetupHeader: React.FC<{ title: string; icon: React.ReactNode }> = ({
  title,
  icon,
}) => (
  <div className="flex items-center justify-center mb-8 text-2xl font-bold text-gray-700">
    {icon}
    <h2 className="ml-3">{title}</h2>
  </div>
);

// --- 各設定画面のコンポーネント ---

// 1. 言語選択
const LanguageSelection: React.FC<StepProps> = ({ nextStep }) => {
  const { updateSettings } = useSettings();
  const updateLanguage = (lang: string) => {
    const langCode = lang === "日本語" ? "ja" : "en";
    updateSettings({ language: langCode });
    nextStep();
  };
  return (
    <div>
      <SetupHeader
        title="言語を選択"
        icon={<Globe className="w-8 h-8 text-blue-500" />}
      />
      <p className="text-center text-gray-500 mb-8">
        アプリケーションで使用する言語を選択してください。
      </p>
      <div className="space-y-4">
        {["日本語", "English"].map((lang) => (
          <button
            key={lang}
            onClick={() => updateLanguage(lang)}
            className="w-full text-left p-4 bg-white rounded-lg border hover:bg-blue-50 hover:border-blue-500 transition-colors duration-200"
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
};

// 2. ブラウザ選択
const BrowserSelection: React.FC<StepProps> = ({ nextStep }) => {
  const { updateSettings } = useSettings();
  const updateBrowser = (browser: string) => {
    //      | "brave" "chrome" "chromium" "edge" "firefox" "safari" "opera" "vivaldi"

    const browserCode =
      browser === "brave"
        ? "brave"
        : browser === "chrome"
        ? "chrome"
        : browser === "chromium"
        ? "chromium"
        : browser === "edge"
        ? "edge"
        : browser === "firefox"
        ? "firefox"
        : browser === "safari"
        ? "safari"
        : browser === "opera"
        ? "opera"
        : "vivaldi"; // デフォルトはvivaldi

    updateSettings({ cookie: browserCode });
    nextStep();
  };
  return (
    <div>
      <SetupHeader
        title="キャッシュ取得先を選択"
        icon={<HardDrive className="w-8 h-8 text-green-500" />}
      />
      <p className="text-center text-gray-500 mb-8">
        クッキーを取得するブラウザを選択してください。
      </p>
      <div className="space-y-4 grid grid-cols-2 gap-1">
        {[
          "brave",
          "chrome",
          "chromium",
          "edge",
          "firefox",
          "safari",
          "opera",
          "vivaldi",
        ].map((browser) => (
          <button
            key={browser}
            onClick={() => updateBrowser(browser)}
            className="w-full text-left p-4 bg-white rounded-lg border hover:bg-green-50 hover:border-green-500 transition-colors duration-200"
          >
            {browser}
          </button>
        ))}
      </div>
    </div>
  );
};

// 3. チャンネルリスト読み込み
const ChannelListImport: React.FC<StepProps> = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newChannelUrl, setNewChannelUrl] = useState<string>("");
  const { appSettings, addFollowChannel } = useSettings();

  const addChannel = async () => {
    if (!newChannelUrl.trim()) return;
    setIsLoading(true);
    console.log("Adding channel:", newChannelUrl);
    const newChannel = await invoke("dlp_get_channel_info", {
      channelUrl: newChannelUrl,
    });
    const parsedChannel = JSON.parse(newChannel as string);
    console.log("Parsed Channel Info:", parsedChannel);
    const addingChannel = {
      id: parsedChannel.channel_id,
      channelName: parsedChannel.channel_name,
    };

    addFollowChannel(addingChannel.id, addingChannel.channelName);
    setIsLoading(false);

    console.log("New channel info:", newChannel);

    setNewChannelUrl("");
  };

  const removeChannel = async (channelId: string) => {
    console.log("Removing channel:", channelId);
  };

  const setChannels = (channels: { id: string; channelName: string }[]) => {
    console.log("Reordered channels:", channels);
    // 本来はここで設定を更新する
  };

  return (
    <div>
      <SetupHeader
        title="チャンネルリストを読み込み"
        icon={<Users className="w-8 h-8 text-purple-500" />}
      />
      <p className="text-center text-gray-500 mb-8">
        登録しているチャンネルのリストを読み込みます。
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
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white font-bold p-2 rounded-lg transition-colors"
        >
          {isLoading ? <SpinnerLoader /> : <PlusCircle size={20} />}
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto pr-2">
        {appSettings.followChannel.length === 0 && (
          <p className="text-neutral-400">
            登録されているチャンネルはありません。
          </p>
        )}
        {appSettings.followChannel.length > 0 && (
          <Reorder.Group
            as="ul"
            axis="y"
            values={appSettings.followChannel}
            onReorder={setChannels}
            className="space-y-2"
          >
            {appSettings.followChannel.map((channel) => (
              <Reorder.Item
                key={channel.id}
                value={channel}
                as="li"
                className="flex items-center bg-neutral-800/50 p-2 rounded-lg"
              >
                <div className="text-neutral-400 cursor-grab mr-3">
                  <GripVertical size={20} />
                </div>

                <span className="text-white font-medium flex-grow truncate">
                  {channel.channelName}
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
        )}
      </div>
    </div>
  );
};

// 4. 詳細設定
const AdvancedSettings: React.FC<StepProps> = () => {
  const { appSettings, updateSettings } = useSettings();
  return (
    // 全体のコンテナ。余白を調整し、レスポンシブに対応
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <SetupHeader
        title="詳細設定"
        // アイコンの色とサイズを白背景に合わせて調整
        icon={<Settings className="w-6 h-6 text-gray-700" />}
      />
      <p className="text-center text-gray-600 mb-6 text-sm">
        アプリケーションの動作をカスタマイズします。
      </p>

      {/* 設定項目全体のコンテナ */}
      <div className="rounded-lg border border-gray-200 p-4 sm:p-6 bg-white">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
          品質設定
        </h2>

        {/* 各設定項目のラッパー */}
        <div className="space-y-4">
          {/* 優先解像度 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900">
                優先解像度
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                再生する動画のデフォルト解像度を選択します。
              </p>
            </div>
            <div className="mt-2 sm:mt-0 flex-shrink-0">
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
          </div>

          {/* 優先コーデック */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900">
                優先コーデック
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                対応している場合に優先して使用する映像コーデックです。
              </p>
            </div>
            <div className="mt-2 sm:mt-0 flex-shrink-0">
              <SettingSelect
                value={appSettings.settings.codecs}
                options={["av1", "vp9", "h264"]}
                onChange={(value) =>
                  updateSettings({ codecs: value as "av1" | "vp9" | "h264" })
                }
              />
            </div>
          </div>

          {/* 優先音質 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900">優先音質</h3>
              <p className="text-gray-500 text-xs mt-1">
                音声の品質を選択します。
              </p>
            </div>
            <div className="mt-2 sm:mt-0 flex-shrink-0">
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

          {/* HighFrameRate */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900">
                High Frame Rate (HFR)
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                動画をより滑らかに再生するかどうかを選択します。
              </p>
            </div>
            <div className="mt-2 sm:mt-0 flex-shrink-0">
              <SettingSelect
                value={appSettings.settings.hfr ? "on" : "off"}
                options={["on", "off"]}
                onChange={(value) => updateSettings({ hfr: value === "on" })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// 5. ライブラリダウンロード
const LibraryDownload: React.FC<StepProps> = ({ nextStep }) => {
  const [progress, setProgress] = useState<number>(0);
  const [downloadStatus, setDownloadStatus] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleDownload = () => {
    setIsDownloading(true);
    listen("ytdlp_status", (event) => {
      console.log("Received event:", event);
      const data = event.payload as emitter;
      setProgress(data.progress);
      setDownloadStatus(data.status);
    });
    const result = invoke<string>("check_and_update");
    console.log("Update result:", result);
  };

  useEffect(() => {
    // ダウンロード完了時の処理
    if (progress === 100) {
      setIsDownloading(false);
      setTimeout(() => {
        nextStep(); // 次のステップへ進む
      }, 1000);
    }
  }, [progress]);

  return (
    <div>
      <SetupHeader
        title="ライブラリを準備"
        icon={<Download className="w-8 h-8 text-red-500" />}
      />
      <p className="text-center text-gray-500 mb-8">
        快適な動画再生に必要なライブラリをダウンロードします。
      </p>
      <div className="flex flex-col items-center">
        {!isDownloading && progress === 0 && (
          <button
            onClick={handleDownload}
            className="px-8 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors duration-200"
          >
            ダウンロード開始
          </button>
        )}
        {(isDownloading || progress > 0) && (
          <div className="w-full text-center">
            <div className="w-full bg-gray-200 rounded-full h-4 mt-6">
              <div
                className="bg-red-500 h-4 rounded-full transition-all duration-300 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="mt-4 text-gray-600 font-semibold">{downloadStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 6. 完了画面
const CompletionScreen: React.FC = () => (
  <div className="text-center flex flex-col justify-center h-full">
    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6 animate-pulse" />
    <h2 className="text-3xl font-bold text-gray-800 mb-2">セットアップ完了</h2>
    <p className="text-gray-500 mb-8">
      準備が整いました。アプリケーションをお楽しみください。
    </p>
    <Link
      to="/home"
      className="px-10 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 self-center inline-block text-center"
    >
      アプリケーションを開始
    </Link>
  </div>
);

// --- プログレスバーコンポーネント ---
const ProgressIndicator: React.FC<{ currentStep: number; steps: string[] }> = ({
  currentStep,
  steps,
}) => (
  <div className="w-full max-w-2xl mb-8">
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                currentStep > index
                  ? "bg-blue-500 text-white"
                  : currentStep === index
                  ? "bg-blue-500 text-white ring-4 ring-blue-200"
                  : "bg-gray-300 text-gray-500"
              }`}
            >
              {currentStep > index ? <CheckCircle size={24} /> : index + 1}
            </div>
            <p
              className={`mt-2 text-xs md:text-sm font-semibold transition-colors duration-300 ${
                currentStep >= index ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {step}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 transition-colors duration-300 mx-2 ${
                currentStep > index ? "bg-blue-500" : "bg-gray-300"
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

// --- メインコンポーネント ---
export default function App() {
  const [[step, direction], setStep] = useState<[number, number]>([0, 0]);
  const { appSettings } = useSettings();
  const stepTitles = [
    "言語",
    "ブラウザ",
    "チャンネル",
    "詳細設定",
    "ライブラリ",
    "完了",
  ];
  const components = [
    LanguageSelection,
    BrowserSelection,
    ChannelListImport,
    AdvancedSettings,
    LibraryDownload,
    CompletionScreen,
  ];

  const CurrentComponent = components[step];

  const paginate = (newDirection: number) => {
    const nextStep = step + newDirection;
    if (nextStep >= 0 && nextStep < components.length) {
      setStep([nextStep, newDirection]);
    }
  };

  const isFinalStep = step === components.length - 1;

  // 言語やブラウザ選択画面では、ボタンクリックで自動的に次に進むように調整
  const handleNext = () => paginate(1);
  const handlePrev = () => paginate(-1);

  if (!appSettings.settings.settingAlready) {
    return (
      <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center font-sans p-4">
        <style>{`
          .toggle-checkbox:checked { right: 0; border-color: #48bb78; }
          .toggle-checkbox:checked + .toggle-label { background-color: #48bb78; }
        `}</style>

        {/* 進行状況インジケーター */}
        <ProgressIndicator currentStep={step} steps={stepTitles.slice(0, -1)} />

        <div
          className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 overflow-scroll relative scroll-smooth"
          style={{ minHeight: "500px" }}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute w-full h-full top-0 left-0 p-8"
            >
              <CurrentComponent nextStep={handleNext} prevStep={handlePrev} />
            </motion.div>
          </AnimatePresence>
        </div>
        {/* ナビゲーションボタン (完了画面では非表示) */}
        {!isFinalStep && (
          <div className="flex justify-between w-full max-w-2xl mt-6">
            <button
              onClick={handlePrev}
              disabled={step === 0}
              className="flex items-center px-6 py-2 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              戻る
            </button>
            {step === 2 && (
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
              >
                次へ
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
              >
                次へ
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  } else {
  }
}

const SettingSelect: FC<{
  options: string[];
  value: string;
  onChange: (value: string) => void;
}> = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  return (
    // コンポーネントの幅をコンパクトに固定
    <div className="relative w-32" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        // 白背景用にスタイルを全面的に変更
        className="w-full flex items-center justify-between bg-white border border-gray-300 px-3 py-1.5 rounded-md text-sm text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 transition-colors"
      >
        <span>{value}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-gray-400" // アイコンの色を調整
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            // ドロップダウンメニューのスタイルを白背景用に変更
            className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
          >
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                // オプション項目のスタイルを白背景用に変更
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                  value === option
                    ? "bg-red-500 text-white" // 選択中のスタイル
                    : "text-gray-700 hover:bg-gray-100" // 通常・ホバー時のスタイル
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

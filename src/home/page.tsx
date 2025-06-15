import React, { useState, useMemo, FC, useEffect, useRef } from "react";
import { motion, AnimatePresence, Transition, anticipate } from "framer-motion";
import {
  Home,
  Youtube,
  ListVideo,
  Menu,
  X,
  PlayCircle,
  Users,
  ThumbsUp,
  Calendar,
  Eye,
  Loader,
} from "lucide-react";
import "../App.css"; // グローバルスタイルをインポート
import { invoke } from "@tauri-apps/api/core";
import VideoPlayer from "../components/player";

// --- 型定義 (TypeScript) ---
interface Channel {
  id: string; // YouTubeのチャンネルID (@-prefixed or legacy)
  atId: string; // @-prefixedのチャンネルID
  name: string;
  icon: string;
  banner: string;
  description: string;
  subscribers: string;
  videos?: Video[];
}

interface Video {
  id?: string; // YouTubeの動画ID
  url: string;
  title?: string;
  thumbnail?: string;
  views?: string;
  date?: string;
}

interface VideoInfo {
  title: string;
  duration: string;
  url: string;
  formats: VideoFormat[];
}

interface VideoFormat {
  format_id: string;
  ext: string;
  quality: string;
  url: string;
}

interface PageState {
  name: "home" | "channel" | "video";
  id: string | null; // チャンネルIDまたは動画ID
}

type NavigateFunction = (page: PageState) => void;

// --- 非同期データ取得のモック ---

// --- アニメーション設定 ---
const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};
const pageTransition = { ease: anticipate, duration: 0.5 };
const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100 },
  },
};

// --- コンポーネント ---

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  navigate: NavigateFunction;
}
const Sidebar: FC<SidebarProps> = ({ isOpen, setIsOpen, navigate }) => {
  const sidebarVariants = { open: { x: 0 }, closed: { x: "-100%" } };
  const navItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  };
  const navItems = [
    {
      icon: Home,
      label: "ホーム",
      page: { name: "home", id: null } as PageState,
    },
    {
      icon: Youtube,
      label: "登録チャンネル",
      page: { name: "home", id: null } as PageState,
    },
    {
      icon: ListVideo,
      label: "マイリスト",
      page: { name: "home", id: null } as PageState,
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

interface VideoCardProps {
  video: Video;
  navigate: NavigateFunction;
}
const VideoCard: FC<VideoCardProps> = ({ video, navigate }) => (
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
          <span>{video.views}回視聴</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={14} />
          <span>{video.date}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

interface ChannelCardProps {
  channel: Channel;
  navigate: NavigateFunction;
}
const ChannelCard: FC<ChannelCardProps> = ({ channel, navigate }) => {
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
              key={video.url}
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

interface PageProps {
  navigate: NavigateFunction;
  channels: Channel[];
}
const HomePage: FC<PageProps> = ({ navigate, channels }) => (
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

interface DetailPageProps extends PageProps {
  id: string;
}
const ChannelPage: FC<DetailPageProps> = ({ id, navigate, channels }) => {
  const channel = useMemo(
    () => channels.find((c) => c.id === id),
    [id, channels]
  );
  if (!channel) return <div>Channel not found</div>;
  return (
    <motion.div
      key={`channel-${id}`}
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={pageTransition}
    >
      <div className="relative h-60 md:h-80 rounded-2xl overflow-hidden -mx-4 md:-mx-8 -mt-4 shadow-2xl">
        <motion.img
          src={channel.banner}
          alt={`${channel.name} banner`}
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent"></div>
      </div>
      <div className="flex flex-col md:flex-row items-center md:items-end -mt-20 md:-mt-24 px-4 md:px-8 z-10 relative">
        <motion.img
          src={channel.icon}
          alt={`${channel.name} icon`}
          className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-neutral-900 bg-neutral-800 shadow-2xl"
          layoutId={`channel-icon-${id}`}
        />
        <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {channel.name}
          </motion.h1>
          <motion.div
            className="text-neutral-400 mt-2 flex items-center justify-center md:justify-start gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>{channel.subscribers}</span>
            </div>
            <span>•</span>
            <div>{channel.videos?.length || 0}本の動画</div>
          </motion.div>
        </div>
        <motion.button
          className="mt-4 md:mt-0 md:ml-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition-colors duration-300 shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          登録する
        </motion.button>
      </div>
      <motion.p
        className="mt-8 text-neutral-300 max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {channel.description}
      </motion.p>
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">動画一覧</h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {channel.videos?.map((video) => (
            <VideoCard key={video.id} video={video} navigate={navigate} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

const VideoPage: FC<DetailPageProps> = ({ id, navigate, channels }) => {
  const [playVideoInfo, setPlayVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [selectedAudioFormat, setSelectedAudioFormat] = useState<string>("");
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

  const handleGetVideoInfo = async () => {
    if (!video.url) return;
    const playInfo = await invoke<VideoInfo>("get_video_info", {
      videoUrl: video.url,
    });
    console.log("Fetched video info:", playInfo);
    setPlayVideoInfo(playInfo);
  };

  return (
    <motion.div
      key={`video-${id}`}
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={pageTransition}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <div className="lg:col-span-2">
        <motion.div
          layoutId={`video-player-${video.id}`}
          className="aspect-video bg-black rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden"
        >
          <VideoPlayer youtubeUrl={video.url} />
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
              <span>{video.date}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <ThumbsUp size={20} /> 1.2万
            </motion.button>
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
          <motion.button
            className="ml-auto bg-white hover:bg-neutral-200 text-black font-bold py-2 px-5 rounded-full transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            登録済み
          </motion.button>
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
                <h4 className="font-semibold text-white leading-tight group-hover:text-red-400 transition-colors">
                  {rv.title}
                </h4>
                <p className="text-sm text-neutral-400 mt-1">{channel.name}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {rv.views}回視聴 • {rv.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [page, setPage] = useState<PageState>({ name: "home", id: null });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [channelList, setChannelList] = useState<Channel[]>([]);
  const channelListRef = useRef<Channel[]>([]); // チャンネルリストの参照を保持
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const hasRun = useRef(false);

  const debugChannelList = ["@hinanotachiba7"]; // デバッグ用のチャンネルリスト
  //
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // チャンネル情報を取得する関数
    const fetchChannelInfo = async (channelID: string): Promise<Channel> => {
      const result = await invoke<string>("dlp_get_channel_info", {
        channelUrl: "https://www.youtube.com/" + channelID,
      });
      const parsedResult = JSON.parse(result);
      console.log("Fetched channel info:", parsedResult);
      const channel: Channel = {
        id: parsedResult.channel_id,
        atId: channelID,
        name: parsedResult.channel_name,
        icon: parsedResult.thumbnail_last,
        banner: parsedResult.thumbnail,
        description: parsedResult.channel_description,
        subscribers: parsedResult.channel_followers,
        videos: [],
      };
      setChannelList((prev) => [...prev, channel]); // UIに進捗を反映
      // ★ 取得したチャンネルオブジェクトを返す
      return channel;
    };

    // すべてのチャンネル情報を順番に取得するラッパー関数
    const fetchAllChannels = async (): Promise<Channel[]> => {
      const channels: Channel[] = [];
      for (const channelId of debugChannelList) {
        try {
          const channelInfo = await fetchChannelInfo(channelId);
          channels.push(channelInfo);
        } catch (error) {
          console.error(
            `Failed to fetch channel info for ${channelId}:`,
            error
          );
        }
      }
      // ★ 取得した全チャンネルの配列を返す
      return channels;
    };

    // チャンネルのトップビデオ（最新動画1本）のURLを取得する関数
    const fetchChannelTopVideoUrl = async (
      channelID: string
    ): Promise<string> => {
      const result = await invoke<string>("dlp_get_channel_newvideo", {
        channelUrl: "https://www.youtube.com/" + channelID,
      });
      console.log("Fetched top video url for channel:", result);
      // ★ 取得した動画URLを返す
      return result;
    };

    // すべてのチャンネルのトップビデオ情報を取得し、チャンネルリストを更新するラッパー関数
    const fetchAllTopVideos = async (
      currentChannels: Channel[]
    ): Promise<Channel[]> => {
      // mapとPromise.allを使って並列処理
      const updatedChannelsPromises = currentChannels.map(async (channel) => {
        try {
          const videoUrl = await fetchChannelTopVideoUrl(channel.atId);
          return {
            ...channel,
            videos: [{ url: videoUrl } as Video],
          };
        } catch (error) {
          console.error(
            `Failed to fetch top videos for ${channel.atId}:`,
            error
          );
          return channel; // エラー時は元の情報を返す
        }
      });
      // ★ 更新された全チャンネルの配列を返す
      return Promise.all(updatedChannelsPromises);
    };

    // ビデオの詳細情報を取得する関数
    const fetchVideoInfo = async (videoUrl: string): Promise<Video> => {
      console.log(`Fetching video info for ${videoUrl}`);
      const result = await invoke<string>("dlp_get_video_info", { videoUrl });
      const parsedResult = JSON.parse(result);
      console.log("Fetched video info:", parsedResult);
      // ★ 詳細情報を持つVideoオブジェクトを返す
      return {
        url: videoUrl,
        id: parsedResult.id,
        title: parsedResult.title,
        thumbnail: parsedResult.thumbnail,
        views: parsedResult.view_count,
        date: parsedResult.upload_date,
      };
    };

    // すべてのビデオの詳細情報を取得し、チャンネルリストを更新するラッパー関数
    const fetchAllVideos = async (
      currentChannels: Channel[]
    ): Promise<Channel[]> => {
      console.log("Fetching all video info...");
      const updatedChannelsPromises = currentChannels.map(async (channel) => {
        if (!channel.videos || channel.videos.length === 0) return channel;

        const updatedVideosPromises = channel.videos.map(async (video) => {
          try {
            if (video.url) {
              return await fetchVideoInfo(video.url);
            }
            return video;
          } catch (error) {
            console.error(
              `Failed to fetch video info for ${video.url}:`,
              error
            );
            return video; // エラー時は元の情報を返す
          }
        });
        const updatedVideos = await Promise.all(updatedVideosPromises);
        return { ...channel, videos: updatedVideos };
      });
      // ★ 更新された全チャンネルの配列を返す
      return Promise.all(updatedChannelsPromises);
    };

    // すべてのデータ取得処理を順番に実行するメインの非同期関数
    const executeSequentially = async () => {
      try {
        // 1. 全てのチャンネル情報を取得
        console.log("--- Start: Fetching all channels ---");
        const channels = await fetchAllChannels();
        setChannelList(channels); // UIに進捗を反映
        console.log("--- End: Fetching all channels ---");

        // 2. 1で取得したリストを元に、全てのトップビデオ情報を取得
        console.log("--- Start: Fetching all top videos ---");
        const channelsWithTopVideos = await fetchAllTopVideos(channels);
        setChannelList(channelsWithTopVideos); // UIに進捗を反映
        console.log("--- End: Fetching all top videos ---");

        // 3. 2で取得したリストを元に、全てのビデオ詳細情報を取得
        console.log("--- Start: Fetching all video info ---");
        const finalChannelList = await fetchAllVideos(channelsWithTopVideos);
        setChannelList(finalChannelList); // UIに最終結果を反映
        console.log("--- End: Fetching all video info ---");
      } catch (error) {
        console.error(
          "An error occurred during the sequential fetch process:",
          error
        );
      }
    };

    executeSequentially();
  }, []); // 依存配列は空のまま

  const navigate: NavigateFunction = (newPage) => {
    if (newPage.name === page.name && newPage.id === page.id) return;
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
          />
        );
      case "video":
        return (
          <VideoPage id={page.id!} navigate={navigate} channels={channelList} />
        );
      case "home":
      default:
        return <HomePage navigate={navigate} channels={channelList} />;
    }
  };

  return (
    <div className="bg-neutral-900 min-h-screen font-sans text-white">
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
        <div className="container mx-auto px-4 md:px-8 py-8">
          <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
        </div>
      </main>
      <button
        onClick={() => console.log(channelList)}
        className="fixed bottom-4 right-4 z-30 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
      >
        <Home size={24} />
        ホーム
      </button>
    </div>
  );
}

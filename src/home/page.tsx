import React, { useState, useMemo, FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import "../App.css";

// --- 型定義 (TypeScript) ---
interface Channel {
  id: number;
  name: string;
  icon: string;
  banner: string;
  description: string;
  subscribers: string;
}

interface Video {
  id: number;
  channelId: number;
  title: string;
  thumbnail: string;
  views: string;
  date: string;
}

interface PageState {
  name: "home" | "channel" | "video";
  id: number | null;
}

type NavigateFunction = (page: PageState) => void;

// --- ダミーデータ ---
const channelsData: Channel[] = [
  {
    id: 1,
    name: "クリエイティブ・コーダー",
    icon: "https://placehold.co/100x100/7E57C2/FFFFFF?text=CC",
    banner: "https://placehold.co/1600x400/311B92/FFFFFF?text=Creative+Coder",
    description:
      "コーディングとデザインの融合。美しく機能的なウェブサイトやアプリケーションを作成するためのテクニックやインスピレーションを提供します。React、Three.js、Framer Motionなどの最新技術を探求。",
    subscribers: "125万",
  },
  {
    id: 2,
    name: "Nature Explorers",
    icon: "https://placehold.co/100x100/66BB6A/FFFFFF?text=NE",
    banner: "https://placehold.co/1600x400/2E7D32/FFFFFF?text=Nature+Explorers",
    description:
      "世界の息をのむような風景、驚くべき野生動物、そして感動的な自然の物語をお届けします。4Kドローン映像やマクロ撮影で、今まで見たことのない地球の姿を発見しましょう。",
    subscribers: "280万",
  },
  {
    id: 3,
    name: "未来ガジェット研究所",
    icon: "https://placehold.co/100x100/42A5F5/FFFFFF?text=FG",
    banner: "https://placehold.co/1600x400/1565C0/FFFFFF?text=Future+Gadgets",
    description:
      "最新のテクノロジーと革新的なガジェットをレビュー＆解説。スマートフォン、AI、VRから、まだ誰も知らないような未来の技術まで、あなたの好奇心を刺激します。",
    subscribers: "89万",
  },
  {
    id: 4,
    name: "美食家のキッチン",
    icon: "https://placehold.co/100x100/FFA726/FFFFFF?text=BK",
    banner:
      "https://placehold.co/1600x400/F57C00/FFFFFF?text=Gourmet's+Kitchen",
    description:
      "家庭で再現できる本格レシピから、世界の珍しい料理まで。料理の楽しさと奥深さを伝えるチャンネル。美しい映像と共に、あなたの食卓を豊かにするヒントをお届けします。",
    subscribers: "150万",
  },
];

const videosData: Video[] = [
  // Creative Coder
  {
    id: 101,
    channelId: 1,
    title:
      "Framer Motion入門：1時間でインタラクティブなアニメーションをマスター",
    thumbnail: "https://placehold.co/400x225/5E35B1/FFFFFF?text=Vid1",
    views: "15万",
    date: "2週間前",
  },
  {
    id: 102,
    channelId: 1,
    title: "React + Three.js で3Dポートフォリオサイトを作る",
    thumbnail: "https://placehold.co/400x225/5E35B1/FFFFFF?text=Vid2",
    views: "28万",
    date: "1ヶ月前",
  },
  {
    id: 103,
    channelId: 1,
    title: "CSS GridとFlexboxの使い分け【完全ガイド】",
    thumbnail: "https://placehold.co/400x225/5E35B1/FFFFFF?text=Vid3",
    views: "45万",
    date: "2ヶ月前",
  },
  {
    id: 104,
    channelId: 1,
    title: "UIデザインの原則：美しさと使いやすさを両立する",
    thumbnail: "https://placehold.co/400x225/5E35B1/FFFFFF?text=Vid4",
    views: "12万",
    date: "3ヶ月前",
  },

  // Nature Explorers
  {
    id: 201,
    channelId: 2,
    title: "【4K】アイスランドの絶景ドローン空撮",
    thumbnail: "https://placehold.co/400x225/4CAF50/FFFFFF?text=Vid1",
    views: "320万",
    date: "3週間前",
  },
  {
    id: 202,
    channelId: 2,
    title: "アマゾンの奥地に棲む珍しい生き物たち",
    thumbnail: "https://placehold.co/400x225/4CAF50/FFFFFF?text=Vid2",
    views: "510万",
    date: "1ヶ月前",
  },
  {
    id: 203,
    channelId: 2,
    title: "ホタルが舞う森の奇跡的な夜",
    thumbnail: "https://placehold.co/400x225/4CAF50/FFFFFF?text=Vid3",
    views: "180万",
    date: "2ヶ月前",
  },

  // 未来ガジェット研究所
  {
    id: 301,
    channelId: 3,
    title: "透明なスマートフォンの実機レビュー！未来はここにある",
    thumbnail: "https://placehold.co/400x225/29B6F6/FFFFFF?text=Vid1",
    views: "98万",
    date: "1週間前",
  },
  {
    id: 302,
    channelId: 3,
    title: "家庭用AIアシスタント頂上決戦！どれが一番賢い？",
    thumbnail: "https://placehold.co/400x225/29B6F6/FFFFFF?text=Vid2",
    views: "120万",
    date: "1ヶ月前",
  },
  {
    id: 303,
    channelId: 3,
    title: "絶対欲しくなる！クラウドファンディングの面白ガジェットTOP5",
    thumbnail: "https://placehold.co/400x225/29B6F6/FFFFFF?text=Vid3",
    views: "75万",
    date: "2ヶ月前",
  },

  // 美食家のキッチン
  {
    id: 401,
    channelId: 4,
    title: "究極のカルボナーラ：生クリーム不要の本格レシピ",
    thumbnail: "https://placehold.co/400x225/FFB74D/FFFFFF?text=Vid1",
    views: "250万",
    date: "4日前",
  },
  {
    id: 402,
    channelId: 4,
    title: "スパイスから作る本格バターチキンカレー",
    thumbnail: "https://placehold.co/400x225/FFB74D/FFFFFF?text=Vid2",
    views: "180万",
    date: "2週間前",
  },
  {
    id: 403,
    channelId: 4,
    title: "絶品！台湾風ルーロー飯の作り方",
    thumbnail: "https://placehold.co/400x225/FFB74D/FFFFFF?text=Vid3",
    views: "110万",
    date: "1ヶ月前",
  },
  {
    id: 404,
    channelId: 4,
    title: "週末に作りたい、本格サワードウブレッド",
    thumbnail: "https://placehold.co/400x225/FFB74D/FFFFFF?text=Vid4",
    views: "95万",
    date: "1ヶ月前",
  },
];

// --- アニメーション設定 ---
const pageVariants = {
  initial: { opacity: 0, y: 30 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -30 },
};

const pageTransition = {
  type: "tween" as const,
  ease: "anticipate" as const,
  duration: 0.5,
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
    },
  },
};

// --- コンポーネント ---

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  navigate: NavigateFunction;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, setIsOpen, navigate }) => {
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

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
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <PlayCircle className="text-red-500" size={30} />
            <h1 className="text-xl font-bold text-white">VideoHub</h1>
          </div>
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
    onClick={() => navigate({ name: "video", id: video.id })}
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
  videos: Video[];
  navigate: NavigateFunction;
}

const ChannelCard: FC<ChannelCardProps> = ({ channel, videos, navigate }) => {
  const channelVideos = videos
    .filter((v) => v.channelId === channel.id)
    .slice(0, 3);

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
          {channelVideos.map((video) => (
            <div
              key={video.id}
              className="group cursor-pointer"
              onClick={() => navigate({ name: "video", id: video.id })}
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
}

const HomePage: FC<PageProps> = ({ navigate }) => {
  return (
    <motion.div
      key="home"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={pageTransition}
    >
      <h1 className="text-4xl font-bold text-white mb-8">人気のチャンネル</h1>
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {channelsData.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            videos={videosData}
            navigate={navigate}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

interface DetailPageProps extends PageProps {
  id: number;
}

const ChannelPage: FC<DetailPageProps> = ({ id, navigate }) => {
  const channel = useMemo(() => channelsData.find((c) => c.id === id), [id]);
  const channelVideos = useMemo(
    () => videosData.filter((v) => v.channelId === id),
    [id]
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
            <div>{channelVideos.length}本の動画</div>
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
          {channelVideos.map((video) => (
            <VideoCard key={video.id} video={video} navigate={navigate} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

const VideoPage: FC<DetailPageProps> = ({ id, navigate }) => {
  const video = useMemo(() => videosData.find((v) => v.id === id), [id]);
  const channel = useMemo(
    () => channelsData.find((c) => c.id === video?.channelId),
    [video]
  );
  const relatedVideos = useMemo(
    () =>
      videosData.filter((v) => v.channelId === video?.channelId && v.id !== id),
    [video]
  );

  if (!video || !channel) return <div>Video not found</div>;

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
          <div
            className="w-full h-full bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${video.thumbnail})` }}
          >
            <div className="w-full h-full bg-black/30 backdrop-blur-md flex items-center justify-center rounded-2xl">
              <PlayCircle className="text-white/80" size={100} />
            </div>
          </div>
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
              onClick={() => navigate({ name: "video", id: rv.id })}
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

  const navigate: NavigateFunction = (newPage) => {
    if (newPage.name === page.name && newPage.id === page.id) return;
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (page.name) {
      case "channel":
        return <ChannelPage id={page.id!} navigate={navigate} />;
      case "video":
        return <VideoPage id={page.id!} navigate={navigate} />;
      case "home":
      default:
        return <HomePage navigate={navigate} />;
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
    </div>
  );
}

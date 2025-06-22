export interface Channel {
  id: string; // YouTubeのチャンネルID (@-prefixed or legacy)
  atId: string; // @-prefixedのチャンネルID
  name: string;
  icon: string;
  banner: string;
  description: string;
  subscribers: string;
  fetchCount?: number; // 動画数の取得に使用
  videos?: Video[];
}

export interface Video {
  id?: string; // YouTubeの動画ID
  url: string;
  title?: string;
  thumbnail?: string;
  views?: string;
  date?: string;
}

export interface emitter {
  status: string; // "success" or "error"
  progress: number; // 進捗率（0-100）
}

export interface PageState {
  name:
    | "home"
    | "channel"
    | "video"
    | "channelList"
    | "playlist"
    | "history"
    | "player"
    | "settings";

  id: string | null; // チャンネルIDまたは動画ID
}

export type NavigateFunction = (page: PageState) => void;

export interface PageProps {
  navigate: NavigateFunction;
  channels: Channel[];
}

export interface DetailPageProps extends PageProps {
  id: string;
  handleUpdateChannelList: (newVideos: Video[], fetchCount: number) => void;
}

export interface UrlPlayerProps {
  name?: string;
  title?: string;
  icon?: string;
  views?: string;
  date?: string;
  likes?: string;
  subscribers?: string;
  channelUrl?: string;
}

export interface AppSettings {
  settings: {
    language: string;
    theme: string;
    volume: number;
    cookie:
      | "brave"
      | "chrome"
      | "chromium"
      | "edge"
      | "firefox"
      | "safari"
      | "opera"
      | "vivaldi"
      | "other";
    codecs: "av1" | "h264" | "vp9";
    resolution: "2160p" | "1440p" | "1080p" | "720p" | "480p" | "360p";
    hfr: boolean;
    audioQuality: "high" | "medium" | "low";
    player: "new" | "dev";
    settingAlready: boolean; // 初期値を追加
  };
  followChannel: {
    id: string;
    channelName: string;
    cache?: Channel;
  }[];
  playlist: {
    [key: string]: {
      name: string;
      thumbnail: string;
      videos: {
        [key: string]: {
          title: string;
          url: string;
          id: string;
          channelName: string;
        };
      };
    };
  };
  history: {
    title: string;
    url: string;
    id: string;
    channelName: string;
    timestamp: number;
  }[];
  state: {
    channelLoading: boolean;
  };
}

export const defaultAppSettings: AppSettings = {
  settings: {
    language: "ja",
    theme: "dark",
    volume: 1,
    cookie: "chrome",
    codecs: "h264",
    resolution: "1080p",
    hfr: true,
    player: "new",
    audioQuality: "high",
    settingAlready: false, // 初期値を追加
  },
  followChannel: [],
  playlist: {},
  history: [],
  state: {
    channelLoading: false,
  },
};

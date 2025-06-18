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

export interface PageState {
  name:
    | "home"
    | "channel"
    | "video"
    | "channelList"
    | "playlist"
    | "history"
    | "player";

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
  channelId?: string; // 追加
}

export interface AppSettings {
  settings: {
    language: string;
    theme: string;
    volume: number;
  };
  followChannel: {
    [key: string]: {
      atId: string;
      channelName: string;
      channelIcon: string;
    };
  };
  playlist: {
    [key: string]: {
      name: string;
      thumbnail: string;
      videos: {
        [key: string]: {
          title: string;
          url: string;
          atId: string;
          channelName: string;
        };
      };
    };
  };
  history: {
    title: string;
    url: string;
    atId: string;
    channelName: string;
    timestamp: number;
  }[];
}

export const defaultAppSettings: AppSettings = {
  settings: {
    language: "ja",
    theme: "dark",
    volume: 100,
  },
  followChannel: {},
  playlist: {},
  history: [],
};

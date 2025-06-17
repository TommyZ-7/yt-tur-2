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
    [key: string]: {
      title: string;
      url: string;
      atId: string;
      channelName: string;
      timestamp: number;
    };
  };
}

export const defaultAppSettings: AppSettings = {
  settings: {
    language: "ja",
    theme: "dark",
    volume: 100,
  },
  followChannel: {},
  playlist: {},
  history: {},
};

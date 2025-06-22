// src/hooks/useSettings.ts
import { useState, useEffect } from "react";
import { LazyStore } from "@tauri-apps/plugin-store";
import { AppSettings, defaultAppSettings, Channel } from "@/types";

const STORE_FILE = "app-settings.json";

export const useAppSettings = () => {
  const [appSettings, setAppSettings] =
    useState<AppSettings>(defaultAppSettings);
  const [isLoading, setIsLoading] = useState(true);
  const store = new LazyStore(STORE_FILE);

  // ストアの初期化と設定読み込み
  useEffect(() => {
    const initStore = async () => {
      try {
        await store.init();
        const savedSettings = await loadAllSettings(store);
        setAppSettings(savedSettings);
      } catch (error) {
        console.error("Failed to initialize store:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initStore();
  }, []);

  useEffect(() => {
    // ストアの変更を監視して、設定が更新された場合ログ出力
    console.log("App settings updated:", appSettings);
  }, [appSettings]);
  // 全設定の読み込み
  const loadAllSettings = async (
    storeInstance: LazyStore
  ): Promise<AppSettings> => {
    try {
      const settings =
        ((await storeInstance.get("settings")) as AppSettings["settings"]) ||
        defaultAppSettings.settings;
      const followChannel =
        ((await storeInstance.get(
          "followChannel"
        )) as AppSettings["followChannel"]) || defaultAppSettings.followChannel; // 空配列を使用
      const playlist =
        ((await storeInstance.get("playlist")) as AppSettings["playlist"]) ||
        defaultAppSettings.playlist;
      const history =
        ((await storeInstance.get("history")) as AppSettings["history"]) ||
        defaultAppSettings.history;
      const state =
        ((await storeInstance.get("state")) as AppSettings["state"]) ||
        defaultAppSettings.state;
      console.log("Loaded settings:", {
        settings,
        followChannel,
        playlist,
        history,
        state,
      });
      return {
        settings,
        followChannel,
        playlist,
        history,
        state,
      };
    } catch (error) {
      console.error("Failed to load settings:", error);
      return defaultAppSettings;
    }
  };

  // 基本設定の更新
  const updateSettings = async (
    newSettings: Partial<AppSettings["settings"]>
  ) => {
    if (!store) return;

    try {
      const updatedSettings = { ...appSettings.settings, ...newSettings };
      await store.set("settings", updatedSettings);
      await store.save();

      setAppSettings((prev) => ({
        ...prev,
        settings: updatedSettings,
      }));
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  // フォローチャンネルの追加
  const addFollowChannel = async (channelId: string, channelName: string) => {
    if (!store) return;
    try {
      if (
        appSettings.followChannel.some((channel) => channel.id === channelId)
      ) {
        console.warn(`Channel with ID ${channelId} already exists.`);
        return;
      }
      const newChannel = {
        id: channelId,
        channelName: channelName,
      };
      const updatedFollowChannels = [...appSettings.followChannel, newChannel];

      await store.set("followChannel", updatedFollowChannels);
      await store.save();

      setAppSettings((prev) => ({
        ...prev,
        followChannel: updatedFollowChannels,
      }));
    } catch (error) {
      console.error("Failed to add follow channel:", error);
    }
  };

  const channelCache = async (channel: Channel) => {
    if (!store) return;
    try {
      // チャンネルキャッシュを更新
      const updatedFollowChannels = appSettings.followChannel.map((c) => {
        if (c.id === channel.id) {
          return { ...c, cache: channel };
        }
        return c;
      });

      await store.set("followChannel", updatedFollowChannels);
      await store.save();

      setAppSettings((prev) => ({
        ...prev,
        followChannel: updatedFollowChannels,
      }));
    } catch (error) {
      console.error("Failed to update channel cache:", error);
    }
  };

  // フォローチャンネルの削除
  const removeFollowChannel = async (channelId: string) => {
    if (!store) return;

    try {
      const updatedFollowChannels = appSettings.followChannel.filter(
        (channel) => channel.id !== channelId
      );

      await store.set("followChannel", updatedFollowChannels);
      await store.save();

      setAppSettings((prev) => ({
        ...prev,
        followChannel: updatedFollowChannels,
      }));
    } catch (error) {
      console.error("Failed to remove follow channel:", error);
    }
  };

  const editFollowChannel = async (channelId: string, moveIndexx: number) => {
    if (!store) return;
    // channelIdをmoveIndexxの位置に移動
    try {
      const updatedFollowChannels = [...appSettings.followChannel];
      const channelIndex = updatedFollowChannels.findIndex(
        (channel) => channel.id === channelId
      );

      if (channelIndex === -1) {
        console.warn(`Channel with ID ${channelId} not found.`);
        return;
      }

      // チャンネルを移動
      const [movedChannel] = updatedFollowChannels.splice(channelIndex, 1);
      updatedFollowChannels.splice(moveIndexx, 0, movedChannel);

      await store.set("followChannel", updatedFollowChannels);
      await store.save();

      setAppSettings((prev) => ({
        ...prev,
        followChannel: updatedFollowChannels,
      }));
    } catch (error) {
      console.error("Failed to edit follow channel:", error);
    }
  };

  // プレイリストの追加/更新
  const updatePlaylist = async (
    playlistId: string,
    playlistData: AppSettings["playlist"][string]
  ) => {
    if (!store) return;

    try {
      const updatedPlaylists = {
        ...appSettings.playlist,
        [playlistId]: playlistData,
      };

      await store.set("playlist", updatedPlaylists);
      await store.save();

      setAppSettings((prev) => ({
        ...prev,
        playlist: updatedPlaylists,
      }));
    } catch (error) {
      console.error("Failed to update playlist:", error);
    }
  };

  // プレイリストに動画を追加
  const addVideoToPlaylist = async (
    playlistId: string,
    videoId: string,
    videoData: AppSettings["playlist"][string]["videos"][string]
  ) => {
    if (!store || !appSettings.playlist[playlistId]) return;

    try {
      const updatedPlaylist = {
        ...appSettings.playlist[playlistId],
        videos: {
          ...appSettings.playlist[playlistId].videos,
          [videoId]: videoData,
        },
      };

      const updatedPlaylists = {
        ...appSettings.playlist,
        [playlistId]: updatedPlaylist,
      };

      await store.set("playlist", updatedPlaylists);
      await store.save();

      setAppSettings((prev) => ({
        ...prev,
        playlist: updatedPlaylists,
      }));
    } catch (error) {
      console.error("Failed to add video to playlist:", error);
    }
  };

  // プレイリストから動画を削除
  const removeVideoFromPlaylist = async (
    playlistId: string,
    videoId: string
  ) => {
    if (!store || !appSettings.playlist[playlistId]) return;

    try {
      const updatedVideos = { ...appSettings.playlist[playlistId].videos };
      delete updatedVideos[videoId];

      const updatedPlaylist = {
        ...appSettings.playlist[playlistId],
        videos: updatedVideos,
      };

      const updatedPlaylists = {
        ...appSettings.playlist,
        [playlistId]: updatedPlaylist,
      };

      await store.set("playlist", updatedPlaylists);
      await store.save();

      setAppSettings((prev) => ({
        ...prev,
        playlist: updatedPlaylists,
      }));
    } catch (error) {
      console.error("Failed to remove video from playlist:", error);
    }
  };

  // プレイリストの削除
  const removePlaylist = async (playlistId: string) => {
    if (!store) return;

    try {
      const updatedPlaylists = { ...appSettings.playlist };
      delete updatedPlaylists[playlistId];

      await store.set("playlist", updatedPlaylists);
      await store.save();

      setAppSettings((prev) => ({
        ...prev,
        playlist: updatedPlaylists,
      }));
    } catch (error) {
      console.error("Failed to remove playlist:", error);
    }
  };

  const editVolume = async (volume: number) => {
    if (!store) return;

    try {
      const updatedSettings = { ...appSettings.settings, volume };
      await store.set("settings", updatedSettings);
      await store.save();

      setAppSettings((prev) => ({
        ...prev,
        settings: updatedSettings,
      }));
    } catch (error) {
      console.error("Failed to edit volume:", error);
    }
  };

  // 履歴の追加
  const addHistory = async (
    historyData: Omit<AppSettings["history"][0], "timestamp">
  ) => {
    if (!store) return;
    console.log("AddHistory called:", historyData);
    try {
      const newHistoryEntry = {
        ...historyData,
        timestamp: Date.now(),
      };
      console.log("Current app settings:", appSettings);

      // 新しい履歴を先頭に追加

      // setAppSettingsを使ってstateを更新し、その最新の値を使用
      setAppSettings((prev) => {
        try {
          const editedHistory = [];

          for (const entry of prev.history) {
            // タイトルが同じものは履歴から除外
            if (entry.title !== newHistoryEntry.title) {
              editedHistory.push(entry);
            }
          }
          console.log("Edited history:", editedHistory);
          const updatedHistory = [newHistoryEntry, ...editedHistory];
          console.log("Updated history:", updatedHistory);
          // storeの更新は非同期で実行
          (async () => {
            try {
              await store.set("history", updatedHistory);
              await store.save();
            } catch (error) {
              console.error("Failed to save history:", error);
            }
          })();

          return {
            ...prev,
            history: updatedHistory,
          };
        } catch (error) {
          const updatedHistory = [newHistoryEntry];
          (async () => {
            try {
              await store.set("history", updatedHistory);
              await store.save();
            } catch (error) {
              console.error("Failed to save history:", error);
            }
          })();
          return {
            ...prev,
            history: updatedHistory,
          };
        }
      });
    } catch (error) {
      console.error("Failed to add history:", error);
    }
  };

  // 履歴の削除（インデックスベース）
  const removeHistory = async (index: number) => {
    if (!store || index < 0 || index >= appSettings.history.length) return;

    try {
      const updatedHistory = appSettings.history.filter((_, i) => i !== index);

      await store.set("history", updatedHistory);
      await store.save();

      setAppSettings((prev) => ({
        ...prev,
        history: updatedHistory,
      }));
    } catch (error) {
      console.error("Failed to remove history:", error);
    }
  };

  // 履歴のクリア
  const clearHistory = async () => {
    if (!store) return;

    try {
      await store.set("history", []);
      await store.save();

      setAppSettings((prev) => ({
        ...prev,
        history: [],
      }));
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  const changeChannnelLoading = (loading: boolean) => {
    appSettings.state = {
      channelLoading: loading,
    };
    setAppSettings((prev) => ({
      ...prev,
      state: appSettings.state,
    }));
  };

  // 全設定のリセット
  const resetAllSettings = async () => {
    if (!store) return;

    try {
      await store.clear();
      await store.save();
      setAppSettings(defaultAppSettings);
    } catch (error) {
      console.error("Failed to reset settings:", error);
    }
  };

  return {
    appSettings,
    isLoading,
    // 基本設定
    updateSettings,
    // フォローチャンネル
    addFollowChannel,
    removeFollowChannel,
    editFollowChannel,
    // チャンネルキャッシュ更新
    channelCache,
    // プレイリスト
    updatePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    removePlaylist,
    // 音量設定
    editVolume,
    // 履歴
    addHistory,
    removeHistory,
    clearHistory,
    //! 状態管理変数 状態管理は今後変更予定
    changeChannnelLoading,
    // 全体操作
    resetAllSettings,
  };
};

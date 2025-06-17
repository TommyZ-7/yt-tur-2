// src/hooks/useSettings.ts
import { useState, useEffect } from "react";
import { Store } from "@tauri-apps/plugin-store";
import { AppSettings, defaultAppSettings } from "@/lib/hooks/settingsInterface";

const STORE_FILE = "app-settings.json";

export const useAppSettings = () => {
  const [appSettings, setAppSettings] =
    useState<AppSettings>(defaultAppSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);

  // ストアの初期化と設定読み込み
  useEffect(() => {
    const initStore = async () => {
      try {
        const storeInstance = await Store.load(STORE_FILE);
        setStore(storeInstance);

        const savedSettings = await loadAllSettings(storeInstance);
        setAppSettings(savedSettings);
      } catch (error) {
        console.error("Failed to initialize store:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initStore();
  }, []);

  // 全設定の読み込み
  const loadAllSettings = async (
    storeInstance: Store
  ): Promise<AppSettings> => {
    try {
      const settings =
        ((await storeInstance.get("settings")) as AppSettings["settings"]) ||
        defaultAppSettings.settings;
      const followChannel =
        ((await storeInstance.get(
          "followChannel"
        )) as AppSettings["followChannel"]) || {};
      const playlist =
        ((await storeInstance.get("playlist")) as AppSettings["playlist"]) ||
        {};
      const history =
        ((await storeInstance.get("history")) as AppSettings["history"]) || {};

      return {
        settings,
        followChannel,
        playlist,
        history,
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
  const addFollowChannel = async (
    channelId: string,
    channelData: AppSettings["followChannel"][string]
  ) => {
    if (!store) return;

    try {
      const updatedChannels = {
        ...appSettings.followChannel,
        [channelId]: channelData,
      };

      await store.set("followChannel", updatedChannels);
      await store.save();

      setAppSettings((prev) => ({
        ...prev,
        followChannel: updatedChannels,
      }));
    } catch (error) {
      console.error("Failed to add follow channel:", error);
    }
  };

  // フォローチャンネルの削除
  const removeFollowChannel = async (channelId: string) => {
    if (!store) return;

    try {
      const updatedChannels = { ...appSettings.followChannel };
      delete updatedChannels[channelId];

      await store.set("followChannel", updatedChannels);
      await store.save();

      setAppSettings((prev) => ({
        ...prev,
        followChannel: updatedChannels,
      }));
    } catch (error) {
      console.error("Failed to remove follow channel:", error);
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

  // 履歴の追加
  const addHistory = async (
    historyId: string,
    historyData: AppSettings["history"][string]
  ) => {
    if (!store) return;

    try {
      const updatedHistory = {
        ...appSettings.history,
        [historyId]: historyData,
      };

      await store.set("history", updatedHistory);
      await store.save();

      setAppSettings((prev) => ({
        ...prev,
        history: updatedHistory,
      }));
    } catch (error) {
      console.error("Failed to add history:", error);
    }
  };

  // 履歴の削除
  const removeHistory = async (historyId: string) => {
    if (!store) return;

    try {
      const updatedHistory = { ...appSettings.history };
      delete updatedHistory[historyId];

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
      await store.set("history", {});
      await store.save();

      setAppSettings((prev) => ({
        ...prev,
        history: {},
      }));
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
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
    // プレイリスト
    updatePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    removePlaylist,
    // 履歴
    addHistory,
    removeHistory,
    clearHistory,
    // 全体操作
    resetAllSettings,
  };
};

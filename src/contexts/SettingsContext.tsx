import React, { createContext, useContext, ReactNode } from "react";
import { useAppSettings } from "@/hooks/useSettings";
import { AppSettings, Channel } from "@/types";

interface SettingsContextType {
  appSettings: AppSettings;
  isLoading: boolean;
  updateSettings: (
    newSettings: Partial<AppSettings["settings"]>
  ) => Promise<void>;
  addFollowChannel: (channelId: string, channelData: string) => Promise<void>;
  removeFollowChannel: (channelId: string) => Promise<void>;
  editFollowChannel: (channelId: string, moveIndex: number) => Promise<void>;
  updatePlaylist: (
    playlistId: string,
    playlistData: AppSettings["playlist"][string]
  ) => Promise<void>;
  channelCache: (channel: Channel) => Promise<void>;
  addVideoToPlaylist: (
    playlistId: string,
    videoId: string,
    videoData: AppSettings["playlist"][string]["videos"][string]
  ) => Promise<void>;
  removeVideoFromPlaylist: (
    playlistId: string,
    videoId: string
  ) => Promise<void>;
  removePlaylist: (playlistId: string) => Promise<void>;
  editVolume: (volume: number) => Promise<void>;
  addHistory: (
    historyData: Omit<AppSettings["history"][0], "timestamp">
  ) => Promise<void>;
  removeHistory: (index: number) => Promise<void>;
  clearHistory: () => Promise<void>;
  changeChannnelLoading: (isLoading: boolean) => void;
  resetAllSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const settingsHook = useAppSettings();

  return (
    <SettingsContext.Provider
      value={{
        appSettings: settingsHook.appSettings,
        isLoading: settingsHook.isLoading,
        updateSettings: settingsHook.updateSettings,
        addFollowChannel: settingsHook.addFollowChannel,
        removeFollowChannel: settingsHook.removeFollowChannel,

        editFollowChannel: settingsHook.editFollowChannel,
        updatePlaylist: settingsHook.updatePlaylist,
        channelCache: settingsHook.channelCache,
        addVideoToPlaylist: settingsHook.addVideoToPlaylist,
        removeVideoFromPlaylist: settingsHook.removeVideoFromPlaylist,
        removePlaylist: settingsHook.removePlaylist,
        editVolume: settingsHook.editVolume,
        addHistory: settingsHook.addHistory,
        removeHistory: settingsHook.removeHistory,
        clearHistory: settingsHook.clearHistory,
        changeChannnelLoading: settingsHook.changeChannnelLoading,
        resetAllSettings: settingsHook.resetAllSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

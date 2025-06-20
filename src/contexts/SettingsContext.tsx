import React, { createContext, useContext, ReactNode } from "react";
import { useAppSettings } from "@/hooks/useSettings";
import { AppSettings } from "@/types";

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
    <SettingsContext.Provider value={settingsHook}>
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

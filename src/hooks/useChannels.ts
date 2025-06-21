import { useState, useEffect, useRef } from "react";
import { Channel, Video } from "@/types";
import { apiService } from "@/services/api";
import { useSettings } from "@/contexts/SettingsContext";

export const useChannels = () => {
  const { appSettings, channelCache, changeChannnelLoading } = useSettings();
  const [channelList, setChannelList] = useState<Channel[]>([]);
  const isRunning = useRef(false);

  useEffect(() => {
    if (isRunning.current) return;
    isRunning.current = true;

    const fetchChannelInfo = async (channelId: string): Promise<Channel> => {
      const channel = await apiService.getChannelInfo(channelId);
      const videos = await apiService.getChannelNewVideos(channelId);

      channel.videos = videos;
      setChannelList((prev) => [...prev, channel]);

      return channel;
    };

    const fetchAllChannels = async (): Promise<Channel[]> => {
      const channels: Channel[] = [];

      for (const channel of appSettings.followChannel) {
        if (channel.cache) {
          try {
            channels.push(channel.cache);
          } catch (error) {
            console.error(
              `Failed to retrieve cached channel info for ${channel.id}:`,
              error
            );
          }
        } else {
          try {
            const channelInfo = await fetchChannelInfo(channel.id);
            channels.push(channelInfo);
            await channelCache(channelInfo);
          } catch (error) {
            console.error(
              `Failed to fetch channel info for ${channel.id}:`,
              error
            );
          }
        }
      }
      return channels;
    };

    const executeSequentially = async () => {
      try {
        console.log("--- Start: Fetching all channels ---");
        changeChannnelLoading(true);
        console.log(appSettings.followChannel);
        const channels = await fetchAllChannels();
        setChannelList(channels);
        isRunning.current = false;
        changeChannnelLoading(false);
        console.log("--- End: Fetching all channels ---");
      } catch (error) {
        console.error(
          "An error occurred during the sequential fetch process:",
          error
        );
      }
    };

    executeSequentially();
  }, [appSettings.followChannel]);

  const handleUpdateChannelList = (
    newVideos: Video[],
    fetchCount: number,
    channelId: string
  ) => {
    setChannelList((prevChannels) =>
      prevChannels.map((channel) => {
        if (channel.id === channelId) {
          return {
            ...channel,
            videos: [...(channel.videos || []), ...newVideos],
            fetchCount: fetchCount,
          };
        }
        return channel;
      })
    );
  };

  return {
    channelList,
    handleUpdateChannelList,
  };
};

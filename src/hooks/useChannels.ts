import { useState, useEffect, useRef } from "react";
import { Channel, Video } from "@/types";
import { apiService } from "@/services/api";

export const useChannels = () => {
  const [channelList, setChannelList] = useState<Channel[]>([]);
  const hasRun = useRef(false);
  
  const debugChannelList = ["@hinanotachiba7", "@bokuwata_ch"];

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const fetchChannelInfo = async (channelId: string): Promise<Channel> => {
      const channel = await apiService.getChannelInfo(channelId);
      const videos = await apiService.getChannelNewVideos(channelId);
      
      channel.videos = videos;
      setChannelList((prev) => [...prev, channel]);
      
      return channel;
    };

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
      return channels;
    };

    const executeSequentially = async () => {
      try {
        console.log("--- Start: Fetching all channels ---");
        const channels = await fetchAllChannels();
        setChannelList(channels);
        console.log("--- End: Fetching all channels ---");
      } catch (error) {
        console.error(
          "An error occurred during the sequential fetch process:",
          error
        );
      }
    };

    executeSequentially();
  }, []);

  const handleUpdateChannelList = (newVideos: Video[], fetchCount: number, channelId: string) => {
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
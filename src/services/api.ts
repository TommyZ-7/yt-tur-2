import { invoke } from "@tauri-apps/api/core";
import { Channel, Video } from "@/types";

export const apiService = {
  async getChannelInfo(channelId: string): Promise<Channel> {
    const result = await invoke<string>("dlp_get_channel_info", {
      channelUrl: "https://www.youtube.com/" + channelId,
    });
    const parsedResult = JSON.parse(result);
    console.log("Parsed Channel Info:", parsedResult);

    return {
      id: parsedResult.channel_id,
      atId: channelId,
      name: parsedResult.channel_name,
      icon: parsedResult.thumbnail_last,
      banner: parsedResult.thumbnail,
      description: parsedResult.channel_description,
      subscribers: parsedResult.channel_followers,
      fetchCount: 8,
      videos: [],
    };
  },

  async getChannelNewVideos(channelId: string): Promise<Video[]> {
    const result = await invoke<string>("dlp_get_channel_newvideo", {
      channelUrl: "https://www.youtube.com/" + channelId + "/videos",
    });
    const parsedResult = JSON.parse(result);

    return parsedResult.map((video: any) => ({
      id: video.video_id,
      url: video.youtube_url,
      title: video.title,
      thumbnail: video.thumbnail_url,
      views: video.view_count,
      date: video.date,
    }));
  },

  async getChannelMoreVideos(
    channelId: string,
    offset: number
  ): Promise<Video[]> {
    const result = await invoke<string>("dlp_get_channel_morevideo", {
      channelUrl: "https://www.youtube.com/" + channelId + "/videos",
      offset: offset,
    });
    const parsedResult = JSON.parse(result);

    return parsedResult.map((video: any) => ({
      id: video.video_id,
      url: video.youtube_url,
      title: video.title,
      thumbnail: video.thumbnail_url,
      views: video.view_count,
      date: video.date,
    }));
  },

  async getVideoInfo(videoUrl: string) {
    const result = await invoke<string>("dlp_get_video_info", {
      videoUrl: videoUrl,
    });
    return JSON.parse(result);
  },
};

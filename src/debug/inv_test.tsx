import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

// Type definitions
interface ChannelInfo {
  name: string;
  icon_url: string;
  banner_url: string;
  description: string;
}

interface VideoInfo {
  title: string;
  video_id: string;
  published: number;
  view_count: number;
  length_seconds: number;
}

interface VideoFormat {
  itag: number;
  url: string;
  mime_type: string;
  quality: string;
  fps?: number;
  bitrate?: number;
}

interface DetailedVideoInfo {
  channel_name: string;
  title: string;
  view_count: number;
  like_count: number;
  formats: VideoFormat[];
}

const InvidiousDebugPage: React.FC = () => {
  const [apiUrl, setApiUrl] = useState("https://api.invidious.io");
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [results, setResults] = useState<{ [key: string]: any }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form states
  const [channelUrl, setChannelUrl] = useState(
    "https://www.youtube.com/channel/UCXuqSBlHAE6Xw-yeJA0Tunw"
  );
  const [videoUrl, setVideoUrl] = useState(
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  );
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(5);
  const [formatId, setFormatId] = useState(22);

  const setTestState = (
    testName: string,
    isLoading: boolean,
    result?: any,
    error?: string
  ) => {
    setLoading((prev) => ({ ...prev, [testName]: isLoading }));
    if (result !== undefined) {
      setResults((prev) => ({ ...prev, [testName]: result }));
    }
    if (error !== undefined) {
      setErrors((prev) => ({ ...prev, [testName]: error }));
    }
  };

  const clearTestResults = (testName: string) => {
    setResults((prev) => {
      const newResults = { ...prev };
      delete newResults[testName];
      return newResults;
    });
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[testName];
      return newErrors;
    });
  };

  // Test functions
  const testGetChannelInfo = async () => {
    const testName = "channelInfo";
    clearTestResults(testName);
    setTestState(testName, true);

    try {
      const result: ChannelInfo = await invoke("inv_get_channel_info", {
        channelUrl,
        apiUrl,
      });
      console.log("Channel Info Result:", result);
      setTestState(testName, false, result);
    } catch (error) {
      setTestState(testName, false, undefined, String(error));
    }
  };

  const testGetNewVideo = async () => {
    const testName = "newVideos";
    clearTestResults(testName);
    setTestState(testName, true);

    try {
      const result: VideoInfo[] = await invoke("inv_get_new_video", {
        channelUrl,
        apiUrl,
      });
      setTestState(testName, false, result);
    } catch (error) {
      setTestState(testName, false, undefined, String(error));
    }
  };

  const testGetVideo = async () => {
    const testName = "videoRange";
    clearTestResults(testName);
    setTestState(testName, true);

    try {
      const result: VideoInfo[] = await invoke("inv_get_video", {
        channelUrl,
        start: startIndex,
        end: endIndex,
        apiUrl,
      });
      setTestState(testName, false, result);
    } catch (error) {
      setTestState(testName, false, undefined, String(error));
    }
  };

  const testGetVideoInfo = async () => {
    const testName = "videoInfo";
    clearTestResults(testName);
    setTestState(testName, true);

    try {
      const result: DetailedVideoInfo = await invoke("inv_get_video_info", {
        videoUrl,
        apiUrl,
      });
      setTestState(testName, false, result);
    } catch (error) {
      setTestState(testName, false, undefined, String(error));
    }
  };

  const testGetVideoUrl = async () => {
    const testName = "videoUrl";
    clearTestResults(testName);
    setTestState(testName, true);

    try {
      const result: string = await invoke("inv_get_video_url", {
        videoUrl,
        formatId,
        apiUrl,
      });
      setTestState(testName, false, result);
    } catch (error) {
      setTestState(testName, false, undefined, String(error));
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${secs
          .toString()
          .padStart(2, "0")}`
      : `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const ResultSection: React.FC<{
    title: string;
    testName: string;
    children: React.ReactNode;
  }> = ({ title, testName, children }) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {loading[testName] && (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        )}
      </div>
      {children}
      {errors[testName] && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 font-semibold">Error:</p>
          <p className="text-red-700">{errors[testName]}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Invidious API Debug Page
          </h1>
          <p className="text-gray-600">
            Test all Invidious API functions with live data
          </p>
        </div>

        {/* Global Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API URL
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://api.invidious.io"
              />
            </div>
          </div>
        </div>

        {/* Channel Info Test */}
        <ResultSection title="1. Channel Info Test" testName="channelInfo">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Channel URL
            </label>
            <input
              type="text"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.youtube.com/channel/..."
            />
          </div>
          <button
            onClick={testGetChannelInfo}
            disabled={loading.channelInfo}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Get Channel Info
          </button>

          {results.channelInfo && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-start space-x-4">
                {results.channelInfo.icon_url && (
                  <img
                    src={results.channelInfo.icon_url}
                    alt="Channel Icon"
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-green-800">
                    {results.channelInfo.name}
                  </h4>
                  <p className="text-green-700 text-sm mt-1">
                    {results.channelInfo.description}
                  </p>
                  {results.channelInfo.banner_url && (
                    <img
                      src={results.channelInfo.banner_url}
                      alt="Banner"
                      className="mt-2 max-w-full h-24 object-cover rounded"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </ResultSection>

        {/* New Videos Test */}
        <ResultSection title="2. New Videos Test" testName="newVideos">
          <button
            onClick={testGetNewVideo}
            disabled={loading.newVideos}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Get New Videos (Latest 3)
          </button>

          {results.newVideos && (
            <div className="mt-4 space-y-3">
              {results.newVideos.map((video: VideoInfo, index: number) => (
                <div
                  key={video.video_id}
                  className="p-4 bg-green-50 border border-green-200 rounded-md"
                >
                  <h4 className="font-semibold text-green-800">
                    {video.title}
                  </h4>
                  <div className="text-sm text-green-700 mt-1">
                    <p>Video ID: {video.video_id}</p>
                    <p>Views: {video.view_count.toLocaleString()}</p>
                    <p>Duration: {formatDuration(video.length_seconds)}</p>
                    <p>Published: {formatTimestamp(video.published)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ResultSection>

        {/* Video Range Test */}
        <ResultSection title="3. Video Range Test" testName="videoRange">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Index
              </label>
              <input
                type="number"
                value={startIndex}
                onChange={(e) => setStartIndex(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Index
              </label>
              <input
                type="number"
                value={endIndex}
                onChange={(e) => setEndIndex(parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={testGetVideo}
            disabled={loading.videoRange}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Get Video Range
          </button>

          {results.videoRange && (
            <div className="mt-4 space-y-3">
              {results.videoRange.map((video: VideoInfo, index: number) => (
                <div
                  key={video.video_id}
                  className="p-4 bg-purple-50 border border-purple-200 rounded-md"
                >
                  <h4 className="font-semibold text-purple-800">
                    {video.title}
                  </h4>
                  <div className="text-sm text-purple-700 mt-1">
                    <p>
                      Index: {startIndex + index} | Video ID: {video.video_id}
                    </p>
                    <p>Views: {video.view_count.toLocaleString()}</p>
                    <p>Duration: {formatDuration(video.length_seconds)}</p>
                    <p>Published: {formatTimestamp(video.published)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ResultSection>

        {/* Video Info Test */}
        <ResultSection title="4. Video Info Test" testName="videoInfo">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video URL
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <button
            onClick={testGetVideoInfo}
            disabled={loading.videoInfo}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Get Video Info
          </button>

          {results.videoInfo && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <h4 className="font-semibold text-red-800">
                {results.videoInfo.title}
              </h4>
              <p className="text-red-700 text-sm">
                Channel: {results.videoInfo.channel_name}
              </p>
              <p className="text-red-700 text-sm">
                Views: {results.videoInfo.view_count.toLocaleString()}
              </p>
              <p className="text-red-700 text-sm">
                Likes: {results.videoInfo.like_count.toLocaleString()}
              </p>

              <div className="mt-3">
                <p className="font-medium text-red-800 mb-2">
                  Available Formats ({results.videoInfo.formats.length}):
                </p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {results.videoInfo.formats.map((format: VideoFormat) => (
                    <div
                      key={format.itag}
                      className="text-xs text-red-700 bg-red-100 p-2 rounded"
                    >
                      <span className="font-medium">ID: {format.itag}</span> |
                      <span> Quality: {format.quality}</span> |
                      <span> Type: {format.mime_type}</span>
                      {format.fps && <span> | FPS: {format.fps}</span>}
                      {format.bitrate && (
                        <span> | Bitrate: {format.bitrate}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ResultSection>

        {/* Video URL Test */}
        <ResultSection title="5. Video Stream URL Test" testName="videoUrl">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format ID
            </label>
            <input
              type="number"
              value={formatId}
              onChange={(e) => setFormatId(parseInt(e.target.value) || 22)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="22"
            />
            <p className="text-xs text-gray-500 mt-1">
              Common format IDs: 22 (720p), 18 (360p), 140 (audio only)
            </p>
          </div>
          <button
            onClick={testGetVideoUrl}
            disabled={loading.videoUrl}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Get Video Stream URL
          </button>

          {results.videoUrl && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
              <p className="font-semibold text-orange-800 mb-2">Stream URL:</p>
              <div className="bg-orange-100 p-3 rounded text-xs font-mono break-all text-orange-800">
                {results.videoUrl}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(results.videoUrl)}
                className="mt-2 px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
              >
                Copy URL
              </button>
            </div>
          )}
        </ResultSection>

        {/* Clear All Results */}
        <div className="text-center">
          <button
            onClick={() => {
              setResults({});
              setErrors({});
            }}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Clear All Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvidiousDebugPage;

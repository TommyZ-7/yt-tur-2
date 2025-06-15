import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

// 型定義
interface ChannelInfo {
  channel_name: string;
  channel_icon_url: string;
  channel_banner_url: string;
  channel_description: string;
}

interface VideoInfo {
  video_id: string;
  title: string;
  published_at: string;
  thumbnail_url: string;
  duration: string;
}

interface DetailedVideoInfo {
  channel_name: string;
  video_title: string;
  view_count: string;
  like_count: string;
  formats: VideoFormat[];
}

interface VideoFormat {
  format_id: string;
  format_note: string;
  ext: string;
  quality: string;
}

interface StreamUrl {
  url: string;
  expires_at: string;
}

interface TestResult {
  success: boolean;
  data: any;
  error?: string;
  duration: number;
}

const YouTubeAPITester: React.FC = () => {
  // State for inputs
  const [apiKey, setApiKey] = useState("");
  const [channelUrl, setChannelUrl] = useState(
    "https://www.youtube.com/@GoogleDevelopers"
  );
  const [videoUrl, setVideoUrl] = useState(
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  );
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(5);
  const [formatId, setFormatId] = useState("22");

  // State for results
  const [results, setResults] = useState<{ [key: string]: TestResult }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [isApiKeySet, setIsApiKeySet] = useState(false);

  // Test function wrapper
  const runTest = async (
    testName: string,
    testFunction: () => Promise<any>
  ) => {
    setLoading((prev) => ({ ...prev, [testName]: true }));
    const startTime = Date.now();

    try {
      const data = await testFunction();
      const duration = Date.now() - startTime;
      setResults((prev) => ({
        ...prev,
        [testName]: { success: true, data, duration },
      }));
    } catch (error) {
      const duration = Date.now() - startTime;
      setResults((prev) => ({
        ...prev,
        [testName]: {
          success: false,
          data: null,
          error: String(error),
          duration,
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [testName]: false }));
    }
  };

  // Test functions
  const testGetChannelInfo = () =>
    runTest("getChannelInfo", async () => {
      if (!apiKey.trim()) {
        throw new Error("API key is required");
      }
      return await invoke<ChannelInfo>("yda_get_channel_info", {
        apiKey: apiKey.trim(),
        channelUrl,
      });
    });

  const testGetNewVideo = () =>
    runTest("getNewVideo", async () => {
      if (!apiKey.trim()) {
        throw new Error("API key is required");
      }
      return await invoke<VideoInfo[]>("yda_get_new_video", {
        apiKey: apiKey.trim(),
        channelUrl,
      });
    });

  const testGetVideo = () =>
    runTest("getVideo", async () => {
      if (!apiKey.trim()) {
        throw new Error("API key is required");
      }
      return await invoke<VideoInfo[]>("yda_get_video", {
        apiKey: apiKey.trim(),
        channelUrl,
        start: startIndex,
        end: endIndex,
      });
    });

  const testGetVideoInfo = () =>
    runTest("getVideoInfo", async () => {
      if (!apiKey.trim()) {
        throw new Error("API key is required");
      }
      return await invoke<DetailedVideoInfo>("yda_get_video_info", {
        apiKey: apiKey.trim(),
        videoUrl,
      });
    });

  const testGetVideoUrl = () =>
    runTest("getVideoUrl", async () => {
      if (!apiKey.trim()) {
        throw new Error("API key is required");
      }
      return await invoke<StreamUrl>("yda_get_video_url", {
        apiKey: apiKey.trim(),
        videoUrl,
        formatId,
      });
    });

  const handleSetApiKey = () => {
    if (apiKey.trim()) {
      setIsApiKeySet(true);
    } else {
      setIsApiKeySet(false);
    }
  };

  const runAllTests = async () => {
    if (!apiKey.trim()) {
      alert("Please enter API key first");
      return;
    }

    await testGetChannelInfo();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Rate limiting
    await testGetNewVideo();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await testGetVideo();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await testGetVideoInfo();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await testGetVideoUrl();
  };

  const clearResults = () => {
    setResults({});
  };

  const formatJson = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  const ResultCard: React.FC<{
    testName: string;
    result: TestResult;
    isLoading: boolean;
    onRetest: () => void;
  }> = ({ testName, result, isLoading, onRetest }) => (
    <div
      className={`border rounded-lg p-4 ${
        result.success
          ? "border-green-300 bg-green-50"
          : "border-red-300 bg-red-50"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold flex items-center">
          {testName}
          <span
            className={`ml-2 w-3 h-3 rounded-full ${
              result.success ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{result.duration}ms</span>
          <button
            onClick={onRetest}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "Testing..." : "Retest"}
          </button>
        </div>
      </div>

      {result.error && (
        <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          <strong>Error:</strong> {result.error}
        </div>
      )}

      {result.success && result.data && (
        <div className="space-y-2">
          {testName === "getChannelInfo" && (
            <div className="flex items-start gap-4">
              {result.data.channel_icon_url && (
                <img
                  src={result.data.channel_icon_url}
                  alt="Channel Icon"
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h4 className="font-medium">{result.data.channel_name}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {result.data.channel_description.substring(0, 100)}...
                </p>
              </div>
            </div>
          )}

          {(testName === "getNewVideo" || testName === "getVideo") && (
            <div className="grid gap-2 md:grid-cols-2">
              {result.data.map((video: VideoInfo) => (
                <div key={video.video_id} className="border rounded p-2">
                  {video.thumbnail_url && (
                    <img
                      src={video.thumbnail_url}
                      alt="Thumbnail"
                      className="w-full h-20 object-cover rounded mb-1"
                    />
                  )}
                  <p className="text-sm font-medium line-clamp-2">
                    {video.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(video.published_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {testName === "getVideoInfo" && (
            <div className="space-y-2">
              <p>
                <strong>Channel:</strong> {result.data.channel_name}
              </p>
              <p>
                <strong>Title:</strong> {result.data.video_title}
              </p>
              <p>
                <strong>Views:</strong>{" "}
                {parseInt(result.data.view_count).toLocaleString()}
              </p>
              <p>
                <strong>Likes:</strong>{" "}
                {parseInt(result.data.like_count).toLocaleString()}
              </p>
              <div>
                <strong>Formats:</strong>
                <ul className="list-disc list-inside text-sm">
                  {result.data.formats.map((format: VideoFormat) => (
                    <li key={format.format_id}>
                      {format.format_note} ({format.ext}) - {format.quality}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
              View Raw JSON Response
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
              {formatJson(result.data)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          YouTube Data API Tester
        </h1>

        {/* API Key Section */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold mb-3 text-blue-800">
            🔑 API Configuration
          </h2>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your YouTube Data API key"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSetApiKey}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Set API Key
            </button>
          </div>
          {isApiKeySet && apiKey.trim() && (
            <p className="text-green-600 text-sm mt-2">
              ✅ API key is ready for use
            </p>
          )}
          {!apiKey.trim() && (
            <p className="text-gray-500 text-sm mt-2">
              ℹ️ Enter your API key to start testing
            </p>
          )}
        </div>

        {/* Test Configuration */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              📺 Channel Configuration
            </h3>
            <input
              type="text"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              placeholder="Channel URL"
              className="w-full p-2 border border-gray-300 rounded mb-3 focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={startIndex}
                onChange={(e) => setStartIndex(parseInt(e.target.value) || 0)}
                placeholder="Start index"
                className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={endIndex}
                onChange={(e) => setEndIndex(parseInt(e.target.value) || 5)}
                placeholder="End index"
                className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              🎥 Video Configuration
            </h3>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Video URL"
              className="w-full p-2 border border-gray-300 rounded mb-3 focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={formatId}
              onChange={(e) => setFormatId(e.target.value)}
              placeholder="Format ID (e.g., 22)"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Test Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={runAllTests}
            disabled={!apiKey.trim() || Object.values(loading).some(Boolean)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            🚀 Run All Tests
          </button>
          <button
            onClick={clearResults}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            🗑️ Clear Results
          </button>
        </div>

        {/* Individual Test Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <button
            onClick={testGetChannelInfo}
            disabled={!apiKey.trim() || loading.getChannelInfo}
            className="p-3 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 text-sm font-medium"
          >
            {loading.getChannelInfo ? "⏳" : "📋"} Channel Info
          </button>
          <button
            onClick={testGetNewVideo}
            disabled={!apiKey.trim() || loading.getNewVideo}
            className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm font-medium"
          >
            {loading.getNewVideo ? "⏳" : "🆕"} New Videos
          </button>
          <button
            onClick={testGetVideo}
            disabled={!apiKey.trim() || loading.getVideo}
            className="p-3 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50 text-sm font-medium"
          >
            {loading.getVideo ? "⏳" : "📹"} Video Range
          </button>
          <button
            onClick={testGetVideoInfo}
            disabled={!apiKey.trim() || loading.getVideoInfo}
            className="p-3 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 text-sm font-medium"
          >
            {loading.getVideoInfo ? "⏳" : "ℹ️"} Video Info
          </button>
          <button
            onClick={testGetVideoUrl}
            disabled={!apiKey.trim() || loading.getVideoUrl}
            className="p-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 text-sm font-medium"
          >
            {loading.getVideoUrl ? "⏳" : "🔗"} Stream URL
          </button>
        </div>
      </div>

      {/* Results Section */}
      {Object.keys(results).length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Test Results</h2>
            <div className="flex gap-2 text-sm">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                ✅ {Object.values(results).filter((r) => r.success).length}{" "}
                Passed
              </span>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                ❌ {Object.values(results).filter((r) => !r.success).length}{" "}
                Failed
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(results).map(([testName, result]) => (
              <ResultCard
                key={testName}
                testName={testName}
                result={result}
                isLoading={loading[testName] || false}
                onRetest={() => {
                  switch (testName) {
                    case "getChannelInfo":
                      testGetChannelInfo();
                      break;
                    case "getNewVideo":
                      testGetNewVideo();
                      break;
                    case "getVideo":
                      testGetVideo();
                      break;
                    case "getVideoInfo":
                      testGetVideoInfo();
                      break;
                    case "getVideoUrl":
                      testGetVideoUrl();
                      break;
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">📖 Usage Guide</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-semibold mb-2 text-gray-700">
              Test Functions:
            </h3>
            <ul className="space-y-1 text-gray-600">
              <li>
                <strong>Channel Info:</strong> Gets channel name, icon, banner,
                description
              </li>
              <li>
                <strong>New Videos:</strong> Fetches latest 3 videos from
                channel
              </li>
              <li>
                <strong>Video Range:</strong> Gets videos from specified range
              </li>
              <li>
                <strong>Video Info:</strong> Gets detailed video information
              </li>
              <li>
                <strong>Stream URL:</strong> Attempts to get streaming URL
                (limited)
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-gray-700">Sample URLs:</h3>
            <ul className="space-y-1 text-gray-600">
              <li>
                <strong>Channel:</strong>{" "}
                https://www.youtube.com/@GoogleDevelopers
              </li>
              <li>
                <strong>Video:</strong>{" "}
                https://www.youtube.com/watch?v=dQw4w9WgXcQ
              </li>
              <li>
                <strong>Format IDs:</strong> 18 (360p), 22 (720p), 137 (1080p)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeAPITester;

import React, { useState } from "react";
import { Search, User, Info, Image, FileImage } from "lucide-react";
import "../App.css"; // Tailwind CSSを使用するためのスタイルシート

interface ChannelInfo {
  author: string;
  description: string;
  authorThumbnails: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  authorBanners: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  subscriberCount: number;
  videoCount: number;
}

const InvidiousChannelViewer: React.FC = () => {
  const [channelUrl, setChannelUrl] = useState<string>("");
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const extractChannelId = (url: string): string | null => {
    // URLからチャンネルIDまたはユーザー名を抽出
    const patterns = [
      /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/user\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/@([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // 直接IDが入力された場合
    if (url.match(/^[a-zA-Z0-9_-]+$/)) {
      return url;
    }

    return null;
  };

  const fetchChannelInfo = async () => {
    if (!channelUrl.trim()) {
      setError("チャンネルURLまたはIDを入力してください");
      return;
    }

    const channelId = extractChannelId(channelUrl);
    if (!channelId) {
      setError("有効なYouTubeチャンネルURLまたはIDを入力してください");
      return;
    }

    setLoading(true);
    setError("");
    setChannelInfo(null);

    try {
      const response = await fetch(
        `https://api.invidious.io/api/v1/channels/${channelId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChannelInfo = await response.json();
      setChannelInfo(data);
    } catch (err) {
      setError(
        "チャンネル情報の取得に失敗しました。チャンネルIDまたはURLを確認してください。"
      );
      console.error("Error fetching channel info:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    fetchChannelInfo();
  };

  const getBestThumbnail = (
    thumbnails: Array<{ url: string; width: number; height: number }>
  ) => {
    if (!thumbnails || thumbnails.length === 0) return null;
    // 最も大きいサムネイルを取得
    return thumbnails.reduce((best, current) =>
      current.width > best.width ? current : best
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <User className="text-red-500" />
          YouTube Channel Info Viewer
        </h1>
        <p className="text-gray-600">
          Invidious APIを使用してYouTubeチャンネル情報を取得します
        </p>
      </div>

      <div className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={channelUrl}
            onChange={(e) => setChannelUrl(e.target.value)}
            placeholder="YouTubeチャンネルURLまたはチャンネルIDを入力..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            onKeyPress={(e) => e.key === "Enter" && fetchChannelInfo()}
          />
          <button
            onClick={fetchChannelInfo}
            disabled={loading}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Search size={16} />
            {loading ? "取得中..." : "取得"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {channelInfo && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 shadow-lg">
          {/* バナー画像 */}
          {channelInfo.authorBanners &&
            channelInfo.authorBanners.length > 0 && (
              <div className="mb-6 -mx-6 -mt-6">
                <img
                  src={getBestThumbnail(channelInfo.authorBanners)?.url}
                  alt="Channel Banner"
                  className="w-full h-32 sm:h-48 object-cover rounded-t-xl"
                />
              </div>
            )}

          <div className="flex flex-col sm:flex-row gap-6">
            {/* アイコン */}
            <div className="flex-shrink-0">
              {channelInfo.authorThumbnails &&
              channelInfo.authorThumbnails.length > 0 ? (
                <img
                  src={getBestThumbnail(channelInfo.authorThumbnails)?.url}
                  alt="Channel Icon"
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="text-gray-500" size={32} />
                </div>
              )}
            </div>

            {/* チャンネル情報 */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {channelInfo.author}
              </h2>

              <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <User size={14} />
                  {channelInfo.subscriberCount?.toLocaleString() || "N/A"}{" "}
                  登録者
                </span>
                <span className="flex items-center gap-1">
                  <FileImage size={14} />
                  {channelInfo.videoCount?.toLocaleString() || "N/A"} 動画
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Info size={16} />
                    チャンネル概要
                  </h3>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {channelInfo.description ||
                        "チャンネルの概要がありません"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Image size={16} />
                      アイコンURL
                    </h4>
                    <div className="bg-white p-3 rounded-lg border text-xs break-all">
                      {getBestThumbnail(channelInfo.authorThumbnails)?.url ||
                        "なし"}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FileImage size={16} />
                      バナーURL
                    </h4>
                    <div className="bg-white p-3 rounded-lg border text-xs break-all">
                      {getBestThumbnail(channelInfo.authorBanners)?.url ||
                        "なし"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 text-sm text-gray-500">
        <p>使用例:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>https://www.youtube.com/channel/UCXuqSBlHAE6Xw-yeJA0Tunw</li>
          <li>https://www.youtube.com/@LinusTechTips</li>
          <li>UCXuqSBlHAE6Xw-yeJA0Tunw (チャンネルIDのみ)</li>
        </ul>
      </div>
    </div>
  );
};

export default InvidiousChannelViewer;

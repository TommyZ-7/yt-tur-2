import { Users } from "lucide-react"; // アイコンは元のまま利用する場合

// スケルトンコンポーネント
export const ChannelCardSkeleton = () => {
  return (
    <div className="bg-neutral-800/50 rounded-2xl overflow-hidden shadow-lg border border-neutral-700/50">
      {/* バナー部分のスケルトン */}
      <div className="h-32 md:h-40 relative">
        <div className="w-full h-full bg-neutral-700 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-800/80 to-transparent"></div>
        {/* アイコン部分のスケルトン */}
        <div className="absolute bottom-[-40px] left-6 w-20 h-20 rounded-full bg-neutral-700 border-4 border-neutral-800 shadow-xl animate-pulse"></div>
      </div>

      <div className="p-6 pt-14">
        {/* チャンネル名のスケルトン */}
        <div className="h-8 w-3/4 bg-neutral-700 rounded-md animate-pulse"></div>

        {/* 登録者数のスケルトン */}
        <div className="flex items-center gap-2 mt-2">
          <Users size={16} className="text-neutral-600" />
          <div className="h-4 w-16 bg-neutral-700 rounded-md animate-pulse"></div>
        </div>

        {/* チャンネル説明のスケルトン */}
        <div className="mt-4 space-y-2">
          <div className="h-4 w-full bg-neutral-700 rounded-md animate-pulse"></div>
          <div className="h-4 w-5/6 bg-neutral-700 rounded-md animate-pulse"></div>
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* 「最新の動画」ヘッダーのスケルトン */}
        <div className="h-6 w-1/3 bg-neutral-700 rounded-md mb-4 animate-pulse"></div>

        {/* 動画一覧のスケルトン */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Array(3).fill(0) を使って3つのスケルトンアイテムを生成 */}
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <div key={index}>
                {/* 動画サムネイルのスケルトン */}
                <div className="w-full aspect-video bg-neutral-700 rounded-lg animate-pulse"></div>
                {/* 動画タイトルのスケルトン */}
                <div className="h-4 w-full bg-neutral-700 rounded-md mt-2 animate-pulse"></div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

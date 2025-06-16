"use client";

import { Link } from "react-router";
import { invoke } from "@tauri-apps/api/core";

const App = () => {
  const get_proxy_url = async () => {
    try {
      const response = await invoke("get_proxy_url_image", {
        imageUrl: "https://i.ytimg.com/vi/98l-7MRE4e8/maxresdefault.jpg",
      });
      return response;
    } catch (error) {
      console.error("Error fetching proxy URL:", error);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Link
        to="/home"
        className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center gap-2"
      >
        ホーム
      </Link>
      <button
        onClick={async () => {
          const proxyUrl = await get_proxy_url();
          if (proxyUrl) {
            console.log("Proxy URL:", proxyUrl);
          } else {
            console.error("Failed to fetch proxy URL.");
          }
        }}
        className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium"
      >
        プロキシURLを取得
      </button>
    </div>
  );
};

export default App;

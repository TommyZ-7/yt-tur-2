import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter, Routes, Route } from "react-router";
import "./App.css";

const HomePage = React.lazy(() => import("./home/page"));
const YouTubeAPITester = React.lazy(() => import("./debug/yda_test"));
const InvidiousDebugPage = React.lazy(() => import("./debug/inv_test"));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/yda-test" element={<YouTubeAPITester />} />
          <Route path="/invidious-debug" element={<InvidiousDebugPage />} />
          {/* 他のルートをここに追加 */}
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
//     setChannelInfo("");

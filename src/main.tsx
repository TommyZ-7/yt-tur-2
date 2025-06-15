import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter, Routes, Route } from "react-router";

const HomePage = React.lazy(() => import("./home/page"));
const InvidiousTestPage = React.lazy(() => import("./invidous-test/page"));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/invidious-test" element={<InvidiousTestPage />} />
          {/* 他のルートをここに追加 */}
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
//     setChannelInfo("");

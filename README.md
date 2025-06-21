# yt-tur

Windows 用の非公式 YouTube クライアントです。  
yt-dlp を内蔵しており、広告なしで動画を再生できます。

## 🌟 特徴

- **広告なし再生**: yt-dlp を使用して広告をスキップした動画再生
- **チャンネル管理**: お気に入りのチャンネルを登録・管理
- **プレイリスト機能**: 動画をプレイリストで整理
- **視聴履歴**: 過去に視聴した動画の履歴を保存
- **カスタム設定**: 音量設定やその他の再生設定をカスタマイズ
- **モダン UI**: React + TypeScript + Tailwind CSS による直感的なインターフェース

## 🚀 技術スタック

### フロントエンド

- **React 18** - UI ライブラリ
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - スタイリング
- **Framer Motion** - アニメーション
- **React Router** - ルーティング
- **Vite** - ビルドツール

### バックエンド

- **Tauri** - デスクトップアプリフレームワーク
- **Rust** - バックエンドロジック
- **yt-dlp** - YouTube 動画ダウンロード/ストリーミング

## 📦 インストール

### 前提条件

- Node.js (v18 以上)
- Rust (最新版)
- Bun または npm

### セットアップ

1. リポジトリをクローン

```bash
git clone https://github.com/your-username/yt-tur.git
cd yt-tur
```

2. 依存関係をインストール

```bash
bun install
# または
npm install
```

3. Tauri の依存関係をインストール

```bash
bunx tauri info
# または
npx tauri info
```

## 🛠️ 開発

### 開発サーバーの起動

```bash
bun run tauri dev
# または
npm run tauri dev
```

### ビルド

```bash
bun run tauri build
# または
npm run tauri build
```

## 📁 プロジェクト構造

```
yt-tur/
├── src/                    # Reactアプリケーション
│   ├── components/         # UIコンポーネント
│   ├── contexts/          # Reactコンテキスト
│   ├── hooks/             # カスタムフック
│   ├── pages/             # ページコンポーネント
│   ├── services/          # API/サービス層
│   └── types/             # TypeScript型定義
├── src-tauri/             # Tauriバックエンド
│   ├── src/               # Rustソースコード
│   │   └── dlp/           # yt-dlp関連の処理
│   └── Cargo.toml         # Rust依存関係
├── public/                # 静的ファイル
└── package.json           # Node.js依存関係
```

## 🎯 主な機能

### 動画再生

- [`new_player.tsx`](src/components/new_player.tsx) - メインの動画プレイヤーコンポーネント
- [`UrlPlayerPage.tsx`](src/pages/UrlPlayerPage.tsx) - URL から動画を再生するページ

### チャンネル管理

- [`get_channel.rs`](src-tauri/src/dlp/get_channel.rs) - チャンネル情報の取得（Rust）
- [`useSettings.ts`](src/hooks/useSettings.ts) - 設定管理フック

### 設定・履歴

- [`SettingsPage.tsx`](src/pages/SettingsPage.tsx) - 設定画面
- 視聴履歴の自動保存機能

## 🔧 設定

アプリケーションの設定は [`useSettings.ts`](src/hooks/useSettings.ts) で管理されており、以下の項目をカスタマイズできます：

- 音量設定
- フォローチャンネル
- プレイリスト
- 視聴履歴

## 📄 ライセンス

このプロジェクトは [GNU General Public License v3.0](LICENSE) の下で公開されています。

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ⚠️ 注意事項

- この README は AI で生成したものです。一部正しくない情報が掲載されている可能性があります
- このソフトは現在未完成です

## 🐛 既知の問題

- 一部の動画で再生が開始されない場合があります
- プロキシ設定が必要な環境では追加設定が必要です

## 📞 サポート

問題や質問がある場合は、[Issues](https://github.com/your-username/yt-tur/issues) でお知らせください。

---

**注意**: この README は AI で生成したものです。一部正しくない情報が掲載されている可能性があります。

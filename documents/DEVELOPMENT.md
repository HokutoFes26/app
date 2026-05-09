# 開発
## 技術スタック

*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **Core:** React 19
*   **UI Library:** Ant Design (antd), Material UI Icons (MUI), Framer Motion, Vaul
*   **Backend:** Supabase
*   **Map:** Leaflet (react-leaflet)
*   **Styling:** CSS

## 環境構築

1.  **リポジトリのクローン:**
    ```bash
    git clone [repository-url]
    cd [project-directory]
    ```
2.  **依存関係のインストール:**
    ```bash
    npm install
    ```
3.  **環境変数の設定:**
    `.env` ファイルを作成し、Supabase から取得したキーを設定します（`.gitignore` によりコミットされないことを確認してください）。また、模擬店用のパスワードとQR認証用キーを設定します。
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
    NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
    NEXT_PUBLIC_BOOTH_ADMIN_EMAIL=booth@example.com
    NEXT_PUBLIC_BOOTH_ADMIN_PASSWORD=
    NEXT_PUBLIC_QR_AUTH_KEY=
    ```
4.  **開発サーバーの起動:**
    ```bash
    npm run dev
    ```

## ビルドとデプロイ

本プロジェクトは GitHub Pages へのデプロイを想定し、静的書き出し（Static Export）を行っています。

*   **ビルドコマンド:** `npm run build`
    *   内部的には `next build` を実行した後、`src/constants/fix-paths.ts` を実行します。
*   **出力先:** `docs/` ディレクトリ（GitHub Pages がここを参照するように設定してください）。
*   **サブディレクトリ対応:** `/app` パスで公開するため、`next.config.ts` で `basePath` と `assetPrefix` を設定しています。

### パス修正スクリプト (`src/constants/fix-paths.ts`)
静的書き出し後の HTML/CSS/JS ファイル内にある絶対パス（例: `/img/...`）を、サブディレクトリ対応のパス（例: `/app/img/...`）に置換する重要なスクリプトです。ビルドが成功しても画像が表示されない場合は、このスクリプトの正規表現を確認してください。
* `npm run dev`ではルートディレクトリ判定ですが、Pagesにデプロイするとリポジトリ名直下となりズレが発生するためこの処理が必要です。

## 特徴的な処理

### 多言語対応 (`src/i18n`)
`react-i18next` を利用しており、`public/locales/` 内の JSON ファイルを編集することでテキストを変更できます。

### データ取得 (`src/contexts/DataProvider.tsx`)
Supabase からのデータ取得と、JSON ファイルからのマスターデータ取得を組み合わせています。
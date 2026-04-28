このリポジトリは、第18回高専祭-北斗祭-のウェブアプリのソースコードを管理するためのものです。このウェブアプリでは、北斗祭での模擬店の混雑・在庫状況、イベントタイムテーブル、バスの発着時刻、落とし物情報、Q&Aをリアルタイムに更新し、スムーズにより楽しく回るためのWebアプリケーションです。

**ホームページ :** [https://hokutofes26.github.io/](https://hokutofes26.github.io/)  
**Web App :** [https://hokutofes26.github.io/app](https://hokutofes26.github.io/app)

## 外観

![スマホ外観](./public/img/demo.png "スマホ外観")

## 特徴

### 1. 操作可能なキャンパスマップ

Leafletを活用したアプリ上のマップで、模擬店、展示、イベントステージの場所を直感的に探すことができます。

### 2. リアルタイムな状況把握

バスの運行状況、落とし物情報、よくある質問（Q&A）など、必要な情報をリアルタイムに確認でき、来場者の利便性向上を両立します。

### 3. 快適なUIとグローバル対応

シンプルで直感的なUI（Ant Design / Material UI icons）を採用し、ダークテーマにも対応。また、日本語と英語の多言語対応（i18n）を行っており、さまざまな来場者も快適に利用できる設計です。

### 4. 運営ページ

Supabase Authによってパスワードログインを通過した運営チーム専用のページにより、同一ウェブアプリ上で情報の配信を行うことができます。

---

## 技術スタック

[![技術スタック](https://skillicons.dev/icons?i=nextjs,react,supabase,ts,css,materialui)](https://skillicons.dev)

### フロントエンド

|            |                                         |
| ---------- | --------------------------------------- |
| Framework  | Next.js 15 (App Router)                 |
| Language   | TypeScript                              |
| UI Library | React 19, Ant Design, Material UI Icons |
| Map        | Leaflet, React Leaflet                  |
| i18n       | i18next, react-i18next                  |

### バックエンド / データベース / ログイン

|      |          |
| ---- | -------- |
| BaaS | Supabase |

### その他ライブラリ

|                 |         |
| --------------- | ------- |
| Styling         | Emotion |
| Date Processing | dayjs   |

---

### 内部管理

## 3種類の権限ロール

このアプリではロールが3種類用意されており、それぞれ行える権限が異なります。
| ユーザー種類 | ロール名 | 付与方法 |
| -- | -- | -- |
|一般 | user | ページにアクセスで自動付与 |
| 模擬店運営 | stall-admin | /app/boothにてログイン成功で付与 |
| 全体運営 | admin | /app/adminにてログイン成功で付与|

<br><br>

|             | ニュース | 模擬店情報 | Q&A                 | 落とし物 |
| ----------- | -------- | ---------- | ------------------- | -------- |
| user        | 受信     | 受信       | 質問送信 / 回答受信 | 受信     |
| stall-admin | 受信     | 送信(更新) | -                   | -        |
| admin       | 送信     | 受信       | 回答返信 / 質問受信 | 送信     |

---

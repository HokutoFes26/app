![banner_dev](https://github.com/Sports-day/.github/assets/58895178/48934343-7dcb-4a3e-a09b-68019857902b)
# Sports-day

Sports-dayは、学校行事である球技大会の運営と進行管理をデジタル技術の活用により、スムーズに行うことを実現するWebアプリケーションです。
従来の紙ベースのアナログな管理方法から脱却し、試合の進行状況をリアルタイムで確認できるデジタルプラットフォームを提供します。

<p align="center">
  <img src="https://github.com/Sports-day/.github/assets/58895178/bb300f4c-2d56-4c7a-8e3b-d9b35427991d" width='800'>
</p>

## 強み
### 1. いつでもどこでも、リアルタイムに進行状況を把握
Webアプリケーションを利用することで、試合の進行状況をリアルタイムで確認できます。
<p align="center">
  <img src="https://github.com/Sports-day/.github/assets/58895178/0cc37bb9-6c6a-4dd7-8b1a-1196ab8a049a" width='800'>
</p>
<p align="center">SPORTSDAY Panel (学生向けアプリケーション)</p>

### 2. ヒュマンエラーを最小限に抑える
紙ベースのアナログな管理方法から脱却し、ヒュマンエラーを最小限に抑えます。
<p align="center">
  <img src="https://github.com/Sports-day/.github/assets/58895178/f2904013-ed1f-45de-adec-311bd5d0b4d3" width='800'>
</p>
<p align="center">SPORTSDAY Form (チーム登録アプリケーション)</p>


### 3. 圧倒的な見やすさ
シンプルで使いやすいデザインを採用し、誰でも直感的に操作できます。
<p align="center">
  <img src="https://github.com/user-attachments/assets/68c9d6c4-770c-4094-b976-db0a75cf18d5" width='800'>
</p>
<p align="center">SPORTSDAY Admin (進行管理アプリケーション)</p>


---

<p align="center">
  <img src="https://github.com/Sports-day/.github/assets/58895178/387d1734-6f1a-4860-b2f7-dae1ae01d724" width='800'>
</p>

## フロントエンド
TypeScript, Next.js, Material-UI, Framer Motion で構成されています。

[sports-day-panel](https://github.com/Sports-day/sports-day-panel)　</br>
点数入力などの管理機能と大会の状況を一覧する機能を有する大会進行用のアプリケーション 


[sports-day-form](https://github.com/Sports-day/sports-day-form)　</br>
参加者やチームを登録し、データベースに保存するためのアプリケーション

[sports-day-admin](https://github.com/Sports-day/sports-day-admin)　</br>
全ての管理機能を有するアプリケーション

## バックエンド

[SportsDayAPI](https://github.com/Sports-day/SportsDayAPI) </br>
認証からユーザー等のリソースの管理・配信を行う RESTful API </br>
Kotlin, Ktor, MySQL, Redis で構成されています。

## インフラストラクチャ

[infra](https://github.com/Sports-day/infra) </br>
Sports-day をデプロイするための Kubernetes マニュフェスト管理レポジトリ
# ccchart

ccusageツールから出力されるJSONデータを読み込み、Web上でインタラクティブなチャートとして可視化するツールです。

## 機能

- ccusage --json出力の読み込み
- 日次/月次の利用量トレンドの可視化
- 期間フィルタリング機能
- ドラッグ＆ドロップでのファイルアップロード
- レスポンシブデザイン

## 必要な環境

- Node.js (v14以上)
- モダンブラウザ (Chrome, Firefox, Safari, Edge)

## インストール

```bash
# リポジトリをクローンまたはダウンロード
cd ccchart

# 依存関係をインストール
npm install
```

## 使用方法

1. サーバーを起動:
```bash
npm start
```

2. ブラウザで http://localhost:3000 にアクセス

3. ccusage --json で出力されたJSONファイルをアップロード or [Fetch ccusage]ボタンで最新のccusageを取得

4. チャートが表示されたら、日付範囲を選択してフィルタリング可能

## ccusageのJSONデータ取得方法

```bash
# 日次レポートをJSON形式で出力
npx ccusage@latest daily --json > daily_usage.json
```

## 技術スタック

- **バックエンド**: Node.js, Express.js
- **フロントエンド**: HTML, CSS, JavaScript
- **チャート**: Chart.js
- **ファイルアップロード**: multer

## ライセンス

MIT License

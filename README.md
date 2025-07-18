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

3. ccusage --json で出力されたJSONファイルをアップロード

4. チャートが表示されたら、日付範囲を選択してフィルタリング可能

## ccusageのJSONデータ取得方法

```bash
# 日次レポートをJSON形式で出力
npx ccusage@latest --since 20250707 daily --json > data/daily_usage.json

# 月次レポートをJSON形式で出力
ccusage monthly --json > monthly_usage.json

# セッションレポートをJSON形式で出力
ccusage session --json > session_usage.json
```

## 開発モード

```bash
# 開発サーバーを起動（ファイル変更時に自動リロード）
npm run dev
```

## 対応データ形式

- ccusage daily --json出力
- ccusage monthly --json出力
- ccusage session --json出力

## 技術スタック

- **バックエンド**: Node.js, Express.js
- **フロントエンド**: HTML, CSS, JavaScript
- **チャート**: Chart.js
- **ファイルアップロード**: multer

## トラブルシューティング

### JSONファイルが読み込めない
- ファイルが正しいccusage --json出力形式であることを確認
- ファイルサイズが大きすぎないか確認

### チャートが表示されない
- ブラウザのコンソールでエラーメッセージを確認
- JSONデータに必要なフィールド（date, tokens等）が含まれているか確認

### サーバーが起動しない
- ポート3000が使用中でないか確認
- Node.jsのバージョンが対応しているか確認

## ライセンス

MIT License

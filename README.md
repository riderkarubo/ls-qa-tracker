# 質問コメント集計アプリ

ライブ配信の質問コメントを集計し、配信現場判定とアーカイブ判定を統合してExcelファイルを出力するWebアプリケーションです。

## 機能

- **ファイルアップロード**: CSV/Excel形式の入力見本ファイルとQA抽出テキストファイルをアップロード
- **データ解析**: 入力ファイルを解析し、質問データを抽出
- **マッチング**: 時刻ベースと類似度ベースのマッチングで質問を関連付け
- **データ統合**: 配信現場判定とアーカイブ判定を統合
- **Excel出力**: 統合されたデータをExcelファイルとして出力

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **UI**: Tailwind CSS
- **CSV処理**: papaparse
- **Excel処理**: xlsx
- **類似度計算**: string-similarity
- **LLM**: OpenAI API (gpt-4o-mini)

## セットアップ

### 依存関係のインストール

```bash
npm install
```

### 環境変数の設定

1. `.env.local.example`を`.env.local`にコピーします：

```bash
cp .env.local.example .env.local
```

2. `.env.local`ファイルを開き、OpenAI APIキーを設定します：

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

OpenAI APIキーは [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) から取得できます。

**注意**: OpenAI APIキーが設定されていない場合、従来の文字列類似度マッチングが使用されます。

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 使用方法

1. **入力見本ファイルのアップロード**: CSVまたはExcel形式の質問ピックアップ表をアップロード
2. **QA抽出テキストファイルのアップロード**: アーカイブから抽出したQAリストをアップロード
3. **処理を実行**: 「処理を実行」ボタンをクリック
4. **Excelファイルのダウンロード**: 処理が完了すると、Excelファイルが自動的にダウンロードされます

## ファイル形式

### 入力見本CSV/Excel

- **1行目**: タイトル行
- **2行目**: ヘッダー行（回答済, Time, User, 質問, 回答方法, コメント補足, 回答, メモ）
- **3行目以降**: データ行

### QA抽出テキスト

```
Q1: {19:07:24} 質問内容
A1: 回答内容
Q2: {19:09:48} 質問内容
A2: 回答内容
...
```

## マッチングロジック

### LLMベースマッチング（推奨）

OpenAI APIキーが設定されている場合、以下のロジックが使用されます：

- **時刻ベースフィルタリング**: 5-10分前後の範囲内で候補を絞り込み
- **LLM意味理解**: OpenAI GPT-4o-miniを使用して質問の意味を理解し、最も適切な回答をマッチング
- **フォールバック**: LLM APIが失敗した場合、自動的に従来の文字列類似度マッチングに切り替え

### 従来のマッチング（フォールバック）

OpenAI APIキーが設定されていない場合、以下のロジックが使用されます：

- **時刻ベース**: 5-10分前後の範囲内で質問をマッチング
- **類似度ベース**: 文字列類似度（Dice係数）を使用して質問をマッチング

### グループ化

同様の質問が同じタイミングで複数ある場合、同じ回答にマッチングされた質問をすべてTRUE判定します。

## プロジェクト構造

```
/
├── app/                    # Next.js app router
│   ├── api/                # API routes
│   ├── page.tsx            # メインページ
│   └── layout.tsx          # レイアウト
├── components/             # React components
│   ├── ui/                 # Base UI components
│   └── ProcessingStatus.tsx
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities
│   ├── csvParser.ts
│   ├── excelParser.ts
│   ├── textParser.ts
│   ├── matcher.ts
│   ├── llmMatcher.ts      # LLMマッチング機能
│   ├── dataIntegrator.ts
│   └── excelGenerator.ts
├── types/                  # TypeScript definitions
└── config/                 # Configuration
```

## 注意事項

- **OpenAI APIコスト**: LLMマッチングを使用する場合、OpenAI APIの使用料金が発生します（gpt-4o-miniを使用してコストを抑制）
- **処理時間**: LLMマッチングを使用する場合、処理時間が増加する可能性があります
- **レート制限**: OpenAI APIのレート制限に注意してください
- **エラーハンドリング**: LLM APIが失敗した場合、自動的に従来の文字列類似度マッチングにフォールバックします

## ライセンス

MIT

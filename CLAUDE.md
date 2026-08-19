# 質問コメント集計アプリ（GitHub: riderkarubo/ls-qa-tracker）

- GitHubリポ名は`ls-qa-tracker`だが、ローカルフォルダ名は`質問コメント集計アプリ_260129`（名称不一致に注意）
- **このリポはpublic**。クライアント名・パス等の機密情報を含むファイル（.omc/state等）は`.gitignore`済み。新たに機密情報を含みうるファイルを追加する際は要注意
- 対象アプリ: https://ls-qa-tracker.vercel.app/（Vercel連携・pushで自動デプロイ）
- 入力ファイル（コメントピックアップシートCSV/Excel）の列マッピングは`lib/inputRowMapper.ts`でヘッダー名ベース自動検出（列順・列数の変更に強い設計。位置決め打ちに戻さないこと）
- **Excel(.xlsx)直接アップロード時の型変換に注意**（260819発覚・修正済み）: SheetJSは「回答済」列をboolean、「Time」列をExcelシリアル値(number)で返す。`lib/inputRowMapper.ts`の`answeredValue()`/`timeValue()`が型で分岐して`'TRUE'`/`'HH:MM:SS'`へ正規化している。この正規化を外して文字列決め打ちの比較（`=== 'TRUE'`・`.split(':')`）に戻すと、CSV経由では動くのにExcel経由だけ判定が全件FALSE/0になる（例外は出ない）。詳細: `~/.claude/skills/learned/xlsx-sheet-to-json-boolean-serial-time-silent-mismatch.md`
- QA抽出テキストは**任意**（260819〜）。未添付時はLLMマッチング（アーカイブ判定）を行わず、コメントピックアップシート単体の配信現場判定のみで集計する
- 出力ファイル名の日付抽出（`lib/outputFileName.ts`）はQA抽出テキストのファイル名から6桁(YYMMDD)・8桁(YYYYMMDD)どちらも対応。8桁は世紀2桁を落として6桁に正規化する
- 出力先Googleスプレッドシート: https://docs.google.com/spreadsheets/d/136qwcBSIkMleF2eYb53j7Tz3LXYsAf0XeRJPxEWGaKE/ （7列固定: 最終回答状況/配信現場判定/アーカイブ判定/回答方法/Time/User/質問）

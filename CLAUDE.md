# 質問コメント集計アプリ（GitHub: riderkarubo/ls-qa-tracker）

- GitHubリポ名は`ls-qa-tracker`だが、ローカルフォルダ名は`質問コメント集計アプリ_260129`（名称不一致に注意）
- **このリポはpublic**。クライアント名・パス等の機密情報を含むファイル（.omc/state等）は`.gitignore`済み。新たに機密情報を含みうるファイルを追加する際は要注意
- 対象アプリ: https://ls-qa-tracker.vercel.app/（Vercel連携・pushで自動デプロイ）
- 入力ファイル（コメントピックアップシートCSV/Excel）の列マッピングは`lib/inputRowMapper.ts`でヘッダー名ベース自動検出（列順・列数の変更に強い設計。位置決め打ちに戻さないこと）
- 出力先Googleスプレッドシート: https://docs.google.com/spreadsheets/d/136qwcBSIkMleF2eYb53j7Tz3LXYsAf0XeRJPxEWGaKE/ （7列固定: 最終回答状況/配信現場判定/アーカイブ判定/回答方法/Time/User/質問）

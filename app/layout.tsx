import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '質問コメント集計アプリ',
  description: 'ライブ配信の質問コメントを集計し、配信現場判定とアーカイブ判定を統合します',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-sans">{children}</body>
    </html>
  );
}

import type { QAItem } from '@/types';

export interface ParseTextResult {
  qaItems: QAItem[];
  errors: string[];
}

export function parseQAText(textContent: string): ParseTextResult {
  const qaItems: QAItem[] = [];
  const errors: string[] = [];

  try {
    const lines = textContent.split('\n');
    let currentQ: { number: number; time: string; question: string } | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        continue;
      }

      const qMatch = trimmedLine.match(/^Q(\d+):\s*\{(\d{2}):(\d{2}):(\d{2})\}\s*(.+)$/);
      if (qMatch) {
        const number = parseInt(qMatch[1], 10);
        const time = `${qMatch[2]}:${qMatch[3]}:${qMatch[4]}`;
        const question = qMatch[5].trim();

        currentQ = { number, time, question };
        continue;
      }

      const aMatch = trimmedLine.match(/^A(\d+):\s*(.+)$/);
      if (aMatch) {
        const number = parseInt(aMatch[1], 10);
        const answer = aMatch[2].trim();

        if (currentQ && currentQ.number === number) {
          qaItems.push({
            number: currentQ.number,
            time: currentQ.time,
            question: currentQ.question,
            answer,
          });
          currentQ = null;
        } else {
          errors.push(`回答A${number}に対応する質問が見つかりません`);
        }
        continue;
      }
    }

    if (currentQ) {
      errors.push(`質問Q${currentQ.number}に対応する回答が見つかりません`);
    }
  } catch (error) {
    errors.push(`テキスト解析エラー: ${error instanceof Error ? error.message : String(error)}`);
  }

  return { qaItems, errors };
}

import OpenAI from 'openai';
import type { QAItem } from '@/types';

const TIME_RANGE_MINUTES = 5;

let apiKeyWarningShown = false;
let apiKeyInvalid = false;

function parseTime(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length !== 3) {
    return 0;
  }
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  return hours * 3600 + minutes * 60 + seconds;
}

function getTimeDifference(time1: string, time2: string): number {
  const seconds1 = parseTime(time1);
  const seconds2 = parseTime(time2);
  return Math.abs(seconds1 - seconds2) / 60;
}

function filterByTimeRange(
  inputTime: string,
  qaItems: QAItem[],
  timeRange: number
): QAItem[] {
  return qaItems.filter(qaItem => {
    const timeDiff = getTimeDifference(inputTime, qaItem.time);
    return timeDiff <= timeRange;
  });
}

function createMatchingPrompt(
  inputQuestion: string,
  candidates: QAItem[]
): string {
  if (candidates.length === 0) {
    return '';
  }

  const candidatesText = candidates
    .map((qa, index) => {
      return `[${index + 1}] 時刻: ${qa.time}\n質問: ${qa.question}\n回答: ${qa.answer}`;
    })
    .join('\n\n');

  return `以下の質問に対して、非常に厳格な基準でマッチング判定を行ってください。

【入力質問】
${inputQuestion}

【候補となる質問と回答】
${candidatesText}

【判定基準（非常に厳格）】
- 入力質問と候補の質問が「完全に同じ意味」である場合のみマッチングしてください
- 質問の主題や内容が異なる場合は必ず「番号: 0」を返してください
- 例：「何度で色が変わるか」と「色は変わりますか」は主題が異なるため、マッチングしない
- 例：「いつ発送されますか」と「いつ届きますか」は主題が異なるため、マッチングしない
- 少しでも意味が異なる場合は「番号: 0」を返してください
- 表現が異なるだけで意味が同じ場合はマッチングしてください（例：「発送はいつですか」と「いつ発送されますか」）
- 曖昧な場合や判断に迷う場合は必ず「番号: 0」を返してください
- 関連性があるだけでは不十分です。完全に同じ質問である必要があります
- 質問の主題が異なる場合は必ず「番号: 0」を返してください

回答は必ず「番号: [数字]」の形式で返してください。
該当する質問がない場合は「番号: 0」と返してください。`;
}

function parseMatchingResponse(
  response: OpenAI.Chat.Completions.ChatCompletion,
  candidates: QAItem[]
): QAItem | null {
  const content = response.choices[0]?.message?.content || '';
  const match = content.match(/番号:\s*(\d+)/);
  
  if (!match) {
    return null;
  }

  const index = parseInt(match[1], 10);
  
  if (index === 0 || index < 1 || index > candidates.length) {
    return null;
  }

  return candidates[index - 1];
}

export async function matchWithLLM(
  inputQuestion: string,
  inputTime: string,
  qaItems: QAItem[]
): Promise<QAItem | null> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  if (apiKeyInvalid) {
    throw new Error('API_KEY_INVALID');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const candidates = filterByTimeRange(inputTime, qaItems, TIME_RANGE_MINUTES);

  if (candidates.length === 0) {
    return null;
  }

  // 候補が1つでもLLM判定を必須にする（自動マッチングを廃止）
  const prompt = createMatchingPrompt(inputQuestion, candidates);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'あなたは質問の意味を理解し、非常に厳格な基準でマッチング判定を行う専門家です。完全に同じ意味の質問のみをマッチングし、少しでも異なる場合はマッチングしないでください。質問の主題や内容が異なる場合は必ずマッチングしないでください。関連性があるだけでは不十分です。曖昧な場合や判断に迷う場合は必ずマッチングしないことを選択してください。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 200,
    });

    return parseMatchingResponse(response, candidates);
  } catch (error: any) {
    if (error?.status === 401 || error?.code === 'invalid_api_key') {
      apiKeyInvalid = true;
      if (!apiKeyWarningShown) {
        console.warn('OpenAI APIキーが無効です。文字列類似度マッチングにフォールバックします。');
        apiKeyWarningShown = true;
      }
      throw new Error('API_KEY_INVALID');
    }
    throw error;
  }
}

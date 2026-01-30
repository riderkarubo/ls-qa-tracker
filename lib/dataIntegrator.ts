import { compareTwoStrings } from 'string-similarity';
import { matchWithLLM } from '@/lib/llmMatcher';
import type { InputQuestion, OutputQuestion, QAItem, JudgmentReason } from '@/types';

// 時間を秒数に変換
function parseTimeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length !== 3) return 0;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// コメントの類似度判定
function areCommentsSimilar(question1: string, question2: string): boolean {
  const similarity = compareTwoStrings(question1, question2);
  return similarity >= 0.85; // 85%以上の類似度（厳格化）
}

export interface IntegrateDataResult {
  outputQuestions: OutputQuestion[];
  judgmentReasons: Array<{
    question: string;
    time: string;
    user: string;
    finalAnswerStatus: boolean;
    liveJudgment: string;
    archiveJudgment: string;
    reason: JudgmentReason;
  }>;
}

export async function integrateData(
  inputQuestions: InputQuestion[],
  qaItems: QAItem[] = [],
  onProgress?: (current: number, total: number) => void
): Promise<IntegrateDataResult> {
  const outputQuestions: OutputQuestion[] = [];
  const judgmentReasons: Array<{
    question: string;
    time: string;
    user: string;
    finalAnswerStatus: boolean;
    liveJudgment: string;
    archiveJudgment: string;
    reason: JudgmentReason;
  }> = [];

  // 1. 基本変換
  for (const inputQ of inputQuestions) {
    const liveJudgment = inputQ.answered === 'TRUE' ? 'TRUE' : '';
    const archiveJudgment = '';
    
    const finalAnswerStatus = liveJudgment === 'TRUE';

    const outputQ: OutputQuestion = {
      finalAnswerStatus,
      liveJudgment,
      archiveJudgment,
      answerMethod: inputQ.answerMethod,
      time: inputQ.time,
      user: inputQ.user,
      question: inputQ.question,
      commentNote: inputQ.commentNote,
      answer: inputQ.answer,
      memo: inputQ.memo,
    };

    outputQuestions.push(outputQ);
  }

  // 2. LLMマッチング
  if (qaItems.length > 0) {
    const totalQuestions = outputQuestions.length;
    for (let i = 0; i < outputQuestions.length; i++) {
      const outputQ = outputQuestions[i];
      
      // 進捗を更新
      if (onProgress) {
        onProgress(i + 1, totalQuestions);
      }
      
      try {
        const matchedQA = await matchWithLLM(
          outputQ.question,
          outputQ.time,
          qaItems
        );
        
        if (matchedQA) {
          outputQ.archiveJudgment = 'TRUE';
          judgmentReasons.push({
            question: outputQ.question,
            time: outputQ.time,
            user: outputQ.user,
            finalAnswerStatus: outputQ.finalAnswerStatus,
            liveJudgment: outputQ.liveJudgment,
            archiveJudgment: outputQ.archiveJudgment,
            reason: {
              archiveReason: `QA抽出テキストのQ${matchedQA.number}とマッチしました: ${matchedQA.question}`,
            },
          });
        }
      } catch (error) {
        // LLMマッチングが失敗した場合はスキップ（エラーログはllmMatcher.tsで出力済み）
        // APIキーが無効な場合などはエラーをスローするが、処理は継続
        if (error instanceof Error && error.message === 'API_KEY_INVALID') {
          // APIキーが無効な場合は、以降のLLMマッチングをスキップ
          break;
        }
        console.warn(`LLMマッチングエラー (${outputQ.question}):`, error);
      }
    }
  }

  // 3. 配信現場判定とアーカイブ判定の排他処理
  // 配信現場判定がTRUEの場合はアーカイブ判定をFALSEにする
  for (const outputQ of outputQuestions) {
    if (outputQ.liveJudgment === 'TRUE') {
      outputQ.archiveJudgment = '';
    }
  }

  // 4. アーカイブ判定ロジックを適用（類似度判定）
  for (let i = 0; i < outputQuestions.length; i++) {
    const current = outputQuestions[i];
    // 配信現場判定がTRUEの場合はスキップ（排他処理のため）
    if (current.answerMethod === '運用者コメ' && current.liveJudgment === 'TRUE') {
      const currentTimeSeconds = parseTimeToSeconds(current.time);
      const currentQuestion = current.question;
      
      // 前のコメントをチェック
      for (let j = i - 1; j >= 0; j--) {
        const prev = outputQuestions[j];
        // 配信現場判定がTRUEの場合はスキップ（排他処理のため）
        if (prev.liveJudgment === 'TRUE') {
          continue;
        }
        const prevTimeSeconds = parseTimeToSeconds(prev.time);
        const timeDiffMinutes = (currentTimeSeconds - prevTimeSeconds) / 60;
        
        // 3分以内かつ類似度判定（厳格化）
        if (timeDiffMinutes >= 0 && timeDiffMinutes <= 3) {
          if (areCommentsSimilar(prev.question, currentQuestion)) {
            prev.archiveJudgment = 'TRUE';
          }
        } else {
          // 3分を超えたら、それより前はチェック不要（時系列順のため）
          break;
        }
      }
    }
  }

  // 5. アーカイブ判定がTRUEの場合は回答方法を「出演者」に変更
  for (const outputQ of outputQuestions) {
    if (outputQ.archiveJudgment === 'TRUE') {
      outputQ.answerMethod = '出演者';
    }
  }

  // 6. 未判定行の回答方法をクリア
  // アーカイブ判定・配信現場判定いずれもTRUEでない行で、
  // 回答方法が「出演者」または「運用者コメ」のものは空白に変更
  for (const outputQ of outputQuestions) {
    const hasJudgment = outputQ.liveJudgment === 'TRUE' || outputQ.archiveJudgment === 'TRUE';
    if (!hasJudgment && (outputQ.answerMethod === '出演者' || outputQ.answerMethod === '運用者コメ')) {
      outputQ.answerMethod = '';
    }
  }

  // 7. finalAnswerStatusを再計算
  for (const outputQ of outputQuestions) {
    outputQ.finalAnswerStatus = outputQ.liveJudgment === 'TRUE' || outputQ.archiveJudgment === 'TRUE';
  }

  return {
    outputQuestions,
    judgmentReasons,
  };
}

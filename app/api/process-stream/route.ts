import { NextRequest } from 'next/server';
import { parseInputCSV } from '@/lib/csvParser';
import { parseInputExcel } from '@/lib/excelParser';
import { parseQAText } from '@/lib/textParser';
import { integrateData } from '@/lib/dataIntegrator';
import { generateExcel } from '@/lib/excelGenerator';
import { getOutputFileName } from '@/lib/outputFileName';
import * as XLSX from 'xlsx';
import type { OutputQuestion, SummaryStats } from '@/types';

/** Vercel Pro: 最大5分。Hobby は 10 秒上限のため要 Pro 以上 */
export const maxDuration = 300;

const encoder = new TextEncoder();

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.floor(seconds)}秒`;
  }
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}分${secs}秒`;
}

function calculateSummaryStats(outputQuestions: OutputQuestion[]): SummaryStats {
  const totalQuestions = outputQuestions.length;
  
  const archiveJudgmentCount = outputQuestions.filter(
    q => q.archiveJudgment === 'TRUE'
  ).length;
  
  const liveJudgmentCount = outputQuestions.filter(
    q => q.liveJudgment === 'TRUE'
  ).length;
  
  const finalAnswerStatusCount = outputQuestions.filter(
    q => q.finalAnswerStatus === true
  ).length;
  
  const skipCount = outputQuestions.filter(
    q => q.answerMethod === 'スルー'
  ).length;
  
  // 質問回答率 = (最終回答状況件数 / (質問コメント件数 - スルー件数)) * 100
  const denominator = totalQuestions - skipCount;
  const answerRate = denominator > 0 
    ? Math.round((finalAnswerStatusCount / denominator) * 1000) / 10 // 小数点第1位まで
    : 0;
  
  return {
    totalQuestions,
    archiveJudgmentCount,
    liveJudgmentCount,
    finalAnswerStatusCount,
    skipCount,
    answerRate,
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let excelBuffer: Buffer | null = null;
  let errorMessage: string | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (
        progress: number,
        message: string,
        stage: 'parsing' | 'integrating' | 'generating' | 'complete' | 'error'
      ) => {
        if (request.signal.aborted) {
          return;
        }

        const elapsed = (Date.now() - startTime) / 1000;
        let estimated: number | undefined;
        
        if (progress > 0 && progress < 100) {
          estimated = (elapsed / progress) * (100 - progress);
        }

        const data = JSON.stringify({
          progress,
          message,
          elapsed,
          estimated,
          stage,
          timestamp: Date.now(),
        });
        
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      const checkAborted = () => {
        if (request.signal.aborted) {
          const cancelData = JSON.stringify({
            progress: 0,
            message: '処理が中断されました',
            elapsed: (Date.now() - startTime) / 1000,
            estimated: undefined,
            stage: 'error',
            error: '処理が中断されました',
            timestamp: Date.now(),
          });
          controller.enqueue(encoder.encode(`data: ${cancelData}\n\n`));
          controller.close();
          return true;
        }
        return false;
      };

      try {
        const formData = await request.formData();
        const inputFile = formData.get('inputFile') as File;
        const qaTextFile = formData.get('qaTextFile') as File;

        if (!inputFile || !qaTextFile) {
          sendProgress(0, 'ファイルが選択されていません', 'error');
          errorMessage = 'ファイルが選択されていません';
          controller.close();
          return;
        }

        sendProgress(5, 'ファイルを読み込んでいます...', 'parsing');

        let inputQuestions;
        const inputErrors: string[] = [];

        if (inputFile.name.endsWith('.csv')) {
          const csvText = await inputFile.text();
          const result = parseInputCSV(csvText);
          inputQuestions = result.questions;
          inputErrors.push(...result.errors);
        } else if (
          inputFile.name.endsWith('.xlsx') ||
          inputFile.name.endsWith('.xls')
        ) {
          const result = await parseInputExcel(inputFile);
          inputQuestions = result.questions;
          inputErrors.push(...result.errors);
        } else {
          sendProgress(0, 'サポートされていないファイル形式です', 'error');
          errorMessage = 'サポートされていないファイル形式です';
          controller.close();
          return;
        }

        sendProgress(10, 'QA抽出テキストを解析しています...', 'parsing');

        const qaText = await qaTextFile.text();
        const qaResult = parseQAText(qaText);

        if (qaResult.errors.length > 0) {
          inputErrors.push(...qaResult.errors);
        }

        sendProgress(30, 'LLMマッチングを実行しています...', 'integrating');

        if (checkAborted()) {
          return;
        }

        const integrateResult = await integrateData(
          inputQuestions,
          qaResult.qaItems,
          (current, total) => {
            // 進捗を更新（30%から80%の間で段階的に更新）
            const progress = 30 + Math.floor((current / total) * 50);
            sendProgress(progress, `LLMマッチング中... (${current}/${total})`, 'integrating');
          }
        );
        const outputQuestions = integrateResult.outputQuestions;
        const judgmentReasons = integrateResult.judgmentReasons;

        sendProgress(80, 'データを統合しています...', 'integrating');

        if (checkAborted()) {
          return;
        }

        sendProgress(90, 'Excelファイルを生成しています...', 'generating');

        const workbook = generateExcel(outputQuestions);
        excelBuffer = XLSX.write(workbook, {
          type: 'buffer',
          bookType: 'xlsx',
          compression: true,
        }) as Buffer;

        sendProgress(100, '処理が完了しました', 'complete');
        
        // 統計情報を計算
        const summaryStats = calculateSummaryStats(outputQuestions);
        const outputFilename = getOutputFileName(qaTextFile.name);

        const finalData = JSON.stringify({
          progress: 100,
          message: '処理が完了しました',
          elapsed: (Date.now() - startTime) / 1000,
          estimated: 0,
          stage: 'complete',
          excelData: excelBuffer.toString('base64'),
          outputFilename,
          judgmentReasons,
          summaryStats,
          timestamp: Date.now(),
        });

        controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
      } catch (error) {
        const elapsed = (Date.now() - startTime) / 1000;
        errorMessage = error instanceof Error ? error.message : '処理中にエラーが発生しました';
        
        const errorData = JSON.stringify({
          progress: 0,
          message: errorMessage,
          elapsed,
          estimated: undefined,
          stage: 'error',
          error: errorMessage,
          timestamp: Date.now(),
        });

        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

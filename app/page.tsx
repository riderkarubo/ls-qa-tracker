'use client';

import React, { useState, useRef } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { Button } from '@/components/ui/Button';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { JudgmentChat } from '@/components/JudgmentChat';
import { SummaryStats } from '@/components/SummaryStats';
import { useFileUpload } from '@/hooks/useFileUpload';
import type { ProcessingStatus as ProcessingStatusType, JudgmentReason, SummaryStats as SummaryStatsType } from '@/types';

interface JudgmentReasonItem {
  question: string;
  time: string;
  user: string;
  finalAnswerStatus: boolean;
  liveJudgment: string;
  archiveJudgment: string;
  reason?: JudgmentReason;
}

export default function Home() {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [qaTextFile, setQATextFile] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatusType>({
    stage: 'idle',
    progress: 0,
    message: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [judgmentReasons, setJudgmentReasons] = useState<JudgmentReasonItem[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStatsType | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { loading, error, upload } = useFileUpload<Blob>();

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
      setProcessingStatus({
        stage: 'idle',
        progress: 0,
        message: '',
      });
      setJudgmentReasons([]);
      setSummaryStats(null);
    }
  };

  const handleProcess = async () => {
    if (!inputFile || !qaTextFile) {
      alert('両方のファイルを選択してください');
      return;
    }

    setIsProcessing(true);
    abortControllerRef.current = new AbortController();
    setJudgmentReasons([]);
    setSummaryStats(null);

    setProcessingStatus({
      stage: 'parsing',
      progress: 0,
      message: 'ファイルを読み込んでいます...',
    });

    try {
      const formData = new FormData();
      formData.append('inputFile', inputFile);
      formData.append('qaTextFile', qaTextFile);

      const response = await fetch('/api/process-stream', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('レスポンスボディを読み取れません');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              setProcessingStatus({
                stage: data.stage || 'parsing',
                progress: data.progress || 0,
                message: data.message || '',
                elapsed: data.elapsed,
                estimated: data.estimated,
              });

              if (data.stage === 'complete' && data.excelData) {
                const binaryString = atob(data.excelData);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], {
                  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = data.outputFilename || '質問回答まとめ.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                // 判定理由データを設定
                if (data.judgmentReasons) {
                  setJudgmentReasons(data.judgmentReasons);
                }

                // 統計情報を設定
                if (data.summaryStats) {
                  setSummaryStats(data.summaryStats);
                }

                // 通知音を鳴らす
                try {
                  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                  const oscillator = audioContext.createOscillator();
                  const gainNode = audioContext.createGain();

                  oscillator.connect(gainNode);
                  gainNode.connect(audioContext.destination);

                  oscillator.frequency.value = 800; // 周波数（Hz）
                  oscillator.type = 'sine';

                  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                  oscillator.start(audioContext.currentTime);
                  oscillator.stop(audioContext.currentTime + 0.3);
                } catch (error) {
                  // 通知音が再生できない場合は無視
                  console.warn('通知音の再生に失敗しました:', error);
                }
              }

              if (data.stage === 'error') {
                throw new Error(data.error || data.message || 'エラーが発生しました');
              }
            } catch (parseError) {
              console.error('進捗データの解析エラー:', parseError);
            }
          }
        }
      }

      setIsProcessing(false);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setProcessingStatus({
          stage: 'idle',
          progress: 0,
          message: '処理が中断されました',
        });
      } else {
        setProcessingStatus({
          stage: 'error',
          progress: 0,
          message: err instanceof Error ? err.message : 'エラーが発生しました',
        });
      }
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 animate-fade-in">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 md:p-12 text-white shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <span className="text-5xl">📊</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
                  質問コメント集計アプリ
                </h1>
                <p className="text-lg md:text-xl text-blue-50 mb-4">
                  ライブ配信の質問コメントを集計し、配信現場判定とアーカイブ判定を統合してExcelファイルを出力します
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold backdrop-blur-sm">
                    🤖 AI分析
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold backdrop-blur-sm">
                    ⚡ 自動マッチング
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold backdrop-blur-sm">
                    📥 Excel出力
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <FileUpload
            label="質問ピックアップ表（CSV/Excel）"
            description="※現場で抽出した質問・回答データをアップロードしてください。"
            accept=".csv,.xlsx,.xls"
            category="primary"
            onFileSelect={setInputFile}
            selectedFile={inputFile}
          />
          <FileUpload
            label="QA抽出テキスト"
            description="※アーカイブ放送から抽出されたQAリストをアップロードしてください。"
            accept=".txt"
            category="secondary"
            onFileSelect={setQATextFile}
            selectedFile={qaTextFile}
          />
        </div>

        {processingStatus.stage !== 'idle' && (
          <div className="mb-8 animate-fade-in">
            <ProcessingStatus status={processingStatus} />
          </div>
        )}

        {summaryStats && (
          <div className="mb-8 animate-fade-in">
            <SummaryStats stats={summaryStats} />
          </div>
        )}

        {judgmentReasons.length > 0 && (
          <div className="mb-8 animate-fade-in">
            <JudgmentChat reasons={judgmentReasons} />
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <h3 className="text-yellow-800 font-bold text-lg mb-1">エラー</h3>
            <p className="text-yellow-600">{error}</p>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Button
            variant="primary"
            onClick={handleProcess}
            disabled={!inputFile || !qaTextFile || isProcessing}
          >
            {isProcessing ? '処理中...' : '処理を実行'}
          </Button>
          {isProcessing && (
            <Button
              variant="secondary"
              onClick={handleCancel}
            >
              中断
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Card } from './ui/Card';
import type { ProcessingStatus as ProcessingStatusType } from '@/types';

interface ProcessingStatusProps {
  status: ProcessingStatusType;
}

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.floor(seconds)}秒`;
  }
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (minutes < 60) {
    return `${minutes}分${secs}秒`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}時間${mins}分`;
}

export function ProcessingStatus({ status }: ProcessingStatusProps) {
  const getStatusMessage = () => {
    switch (status.stage) {
      case 'idle':
        return '待機中';
      case 'parsing':
        return 'ファイルを解析中...';
      case 'integrating':
        return 'データを統合中...';
      case 'generating':
        return 'Excelファイルを生成中...';
      case 'complete':
        return '完了';
      case 'error':
        return 'エラーが発生しました';
      default:
        return '';
    }
  };

  if (status.stage === 'idle') {
    return null;
  }

  return (
    <Card category={status.stage === 'error' ? 'warning' : 'secondary'}>
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          {status.stage === 'complete' ? (
            <span className="text-3xl text-green-600">✓</span>
          ) : status.stage === 'error' ? (
            <span className="text-3xl text-yellow-600">⚠</span>
          ) : (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          )}
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-800">
          {getStatusMessage()}
        </h3>
        {status.stage !== 'error' && status.stage !== 'complete' && (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${status.progress}%` }}
              ></div>
            </div>
            <div className="text-lg font-bold text-gray-700 mb-2">
              {Math.floor(status.progress)}% 完了
            </div>
          </>
        )}
        <p className="text-sm text-gray-600 mb-2">{status.message}</p>
        {(status.elapsed !== undefined || status.estimated !== undefined) && (
          <div className="w-full mt-2 space-y-1 text-xs text-gray-500">
            {status.elapsed !== undefined && (
              <div className="flex justify-between">
                <span>経過時間:</span>
                <span className="font-semibold">{formatTime(status.elapsed)}</span>
              </div>
            )}
            {status.estimated !== undefined && status.estimated > 0 && (
              <div className="flex justify-between">
                <span>残り時間:</span>
                <span className="font-semibold">{formatTime(status.estimated)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

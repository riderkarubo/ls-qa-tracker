'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card } from './ui/Card';
import type { JudgmentReason } from '@/types';

interface JudgmentReasonItem {
  question: string;
  time: string;
  user: string;
  finalAnswerStatus: boolean;
  liveJudgment: string;
  archiveJudgment: string;
  reason?: JudgmentReason;
}

interface JudgmentChatProps {
  reasons: JudgmentReasonItem[];
}

function formatTimeDifference(minutes: number): string {
  if (minutes < 1) {
    return `${Math.floor(minutes * 60)}秒`;
  }
  const mins = Math.floor(minutes);
  const secs = Math.floor((minutes - mins) * 60);
  if (secs === 0) {
    return `${mins}分`;
  }
  return `${mins}分${secs}秒`;
}

function formatJudgmentReason(reason?: JudgmentReason): string {
  if (!reason) {
    return '';
  }

  const parts: string[] = [];

  // TODO: 新しいアーカイブ判定ロジックに合わせて更新
  if (reason.archiveReason) {
    parts.push(`- ${reason.archiveReason}`);
  }

  return parts.join('\n');
}

export function JudgmentChat({ reasons }: JudgmentChatProps) {
  if (reasons.length === 0) {
    return null;
  }

  return (
    <Card category="primary" className="mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <span className="text-3xl">💬</span>
          AI判定理由
        </h2>
        <p className="text-gray-600 text-sm">
          TRUE判定された質問の判定理由とロジックを表示します
        </p>
      </div>

      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
        {reasons.map((item, index) => {
          const reasonText = formatJudgmentReason(item.reason);
          
          if (!reasonText) {
            return null;
          }

          const markdown = `**判定結果**: ${item.finalAnswerStatus ? 'TRUE' : 'FALSE'}

**判定理由**:
${reasonText}

**質問情報**:
- 時刻: ${item.time}
- ユーザー: ${item.user}
- 質問: ${item.question}`;

          return (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 text-gray-700">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold text-gray-900">
                            {children}
                          </strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-2 space-y-1 text-gray-700">
                            {children}
                          </ul>
                        ),
                        li: ({ children }) => (
                          <li className="text-sm">{children}</li>
                        ),
                      }}
                    >
                      {markdown}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

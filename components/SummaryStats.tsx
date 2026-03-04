'use client';

import React from 'react';
import { Card } from './ui/Card';
import type { SummaryStats as SummaryStatsType } from '@/types';

interface SummaryStatsProps {
  stats: SummaryStatsType;
}

export function SummaryStats({ stats }: SummaryStatsProps) {
  const statItems = [
    {
      label: '質問コメント件数',
      value: stats.totalQuestions,
      icon: '💬',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'アーカイブ判定件数',
      value: stats.archiveJudgmentCount,
      icon: '📦',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: '配信現場判定件数',
      value: stats.liveJudgmentCount,
      icon: '📺',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: '最終回答状況件数',
      value: stats.finalAnswerStatusCount,
      icon: '✅',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'スルー件数',
      value: stats.skipCount,
      icon: '⏭️',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      label: '質問回答率',
      value: `${stats.answerRate}%`,
      icon: '📊',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <Card category="primary" className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <span className="text-3xl">📈</span>
          統計サマリ
        </h2>
        <p className="text-gray-600 text-sm">
          処理結果の統計情報を表示します
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statItems.map((item, index) => (
          <div
            key={index}
            className={`${item.bgColor} rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{item.icon}</span>
              <h3 className="text-sm font-semibold text-gray-700">
                {item.label}
              </h3>
            </div>
            <div className={`text-3xl font-bold ${item.color} mt-2`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

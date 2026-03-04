import * as XLSX from 'xlsx';
import type { OutputQuestion } from '@/types';

export function generateExcel(outputQuestions: OutputQuestion[]): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  const statisticsHeader = [
    ['統計情報'],
    ['質問件数'],
    ['合計回答件数'],
    ['運用者コメント回答'],
    ['出演者回答'],
    ['スルー'],
    ['質問回答率'],
    [],
    [],
    [],
    [],
  ];

  const dataHeader = [
    '最終回答状況',
    '配信現場判定',
    'アーカイブ判定',
    '回答方法',
    'Time',
    'User',
    '質問',
    'コメント補足',
    '回答',
    'メモ',
  ];

  const dataRows = outputQuestions.map(q => [
    q.finalAnswerStatus ? 'TRUE' : 'FALSE',
    q.liveJudgment,
    q.archiveJudgment,
    q.answerMethod,
    q.time,
    q.user,
    q.question,
    q.commentNote,
    q.answer,
    q.memo,
  ]);

  const allRows = [
    ...statisticsHeader,
    dataHeader,
    ...dataRows,
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(allRows);

  XLSX.utils.book_append_sheet(workbook, worksheet, '質問回答まとめ');

  return workbook;
}

export function downloadExcel(workbook: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(workbook, filename);
}

import Papa from 'papaparse';
import type { InputQuestion } from '@/types';

export interface ParseCSVResult {
  questions: InputQuestion[];
  errors: string[];
}

export function parseInputCSV(csvContent: string): ParseCSVResult {
  const questions: InputQuestion[] = [];
  const errors: string[] = [];

  try {
    const parsed = Papa.parse<string[]>(csvContent, {
      skipEmptyLines: true,
      header: false,
    });

    if (parsed.errors.length > 0) {
      errors.push(...parsed.errors.map(e => e.message));
    }

    const rows = parsed.data;
    
    if (rows.length < 3) {
      errors.push('CSVファイルには少なくとも3行（タイトル、ヘッダー、データ）が必要です');
      return { questions, errors };
    }

    const headerRow = rows[1];
    const dataRows = rows.slice(2);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      
      if (!row || row.length < 8) {
        continue;
      }

      const question: InputQuestion = {
        answered: row[0]?.trim() || '',
        time: row[1]?.trim() || '',
        user: row[2]?.trim() || '',
        question: row[3]?.trim() || '',
        answerMethod: row[4]?.trim() || '',
        commentNote: row[5]?.trim() || '',
        answer: row[6]?.trim() || '',
        memo: row[7]?.trim() || '',
      };

      if (question.time && question.question) {
        questions.push(question);
      }
    }
  } catch (error) {
    errors.push(`CSV解析エラー: ${error instanceof Error ? error.message : String(error)}`);
  }

  return { questions, errors };
}

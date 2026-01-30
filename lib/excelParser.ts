import * as XLSX from 'xlsx';
import type { InputQuestion } from '@/types';

export interface ParseExcelResult {
  questions: InputQuestion[];
  errors: string[];
}

export async function parseInputExcel(file: File): Promise<ParseExcelResult> {
  const questions: InputQuestion[] = [];
  const errors: string[] = [];

  try {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    if (!worksheet) {
      errors.push('ワークシートが見つかりません');
      return { questions, errors };
    }

    const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, {
      header: 1,
      defval: '',
    });

    if (jsonData.length < 3) {
      errors.push('Excelファイルには少なくとも3行（タイトル、ヘッダー、データ）が必要です');
      return { questions, errors };
    }

    const dataRows = jsonData.slice(2);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      
      if (!row || row.length < 8) {
        continue;
      }

      const question: InputQuestion = {
        answered: (row[0] as string)?.toString().trim() || '',
        time: (row[1] as string)?.toString().trim() || '',
        user: (row[2] as string)?.toString().trim() || '',
        question: (row[3] as string)?.toString().trim() || '',
        answerMethod: (row[4] as string)?.toString().trim() || '',
        commentNote: (row[5] as string)?.toString().trim() || '',
        answer: (row[6] as string)?.toString().trim() || '',
        memo: (row[7] as string)?.toString().trim() || '',
      };

      if (question.time && question.question) {
        questions.push(question);
      }
    }
  } catch (error) {
    errors.push(`Excel解析エラー: ${error instanceof Error ? error.message : String(error)}`);
  }

  return { questions, errors };
}

import * as XLSX from 'xlsx';
import { mapRowsToInputQuestions } from '@/lib/inputRowMapper';
import type { InputQuestion } from '@/types';

export interface ParseExcelResult {
  questions: InputQuestion[];
  errors: string[];
}

export async function parseInputExcel(file: File): Promise<ParseExcelResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    if (!worksheet) {
      return { questions: [], errors: ['ワークシートが見つかりません'] };
    }

    const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, {
      header: 1,
      defval: '',
    });

    return mapRowsToInputQuestions(jsonData);
  } catch (error) {
    return {
      questions: [],
      errors: [`Excel解析エラー: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
}

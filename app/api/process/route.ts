import { NextRequest, NextResponse } from 'next/server';
import { parseInputCSV } from '@/lib/csvParser';
import { parseInputExcel } from '@/lib/excelParser';
import { parseQAText } from '@/lib/textParser';
import { integrateData } from '@/lib/dataIntegrator';
import { generateExcel } from '@/lib/excelGenerator';
import { getOutputFileName } from '@/lib/outputFileName';
import * as XLSX from 'xlsx';
import type { ApiResponse, QAItem } from '@/types';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const inputFile = formData.get('inputFile') as File | null;
    // QA抽出テキストは任意（未指定ならアーカイブ判定なしで集計）
    const qaTextFile = formData.get('qaTextFile') as File | null;

    if (!inputFile) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'コメントピックアップシートが選択されていません',
      });
    }

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
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'サポートされていないファイル形式です',
      });
    }

    let qaItems: QAItem[] = [];

    if (qaTextFile) {
      const qaText = await qaTextFile.text();
      const qaResult = parseQAText(qaText);
      qaItems = qaResult.qaItems;

      if (qaResult.errors.length > 0) {
        inputErrors.push(...qaResult.errors);
      }
    }

    const integrated = await integrateData(inputQuestions, qaItems);
    const outputQuestions = integrated.outputQuestions;

    const workbook = generateExcel(outputQuestions);
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true 
    });

    const outputFilename = getOutputFileName(qaTextFile?.name);
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${outputFilename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : '処理中にエラーが発生しました',
    });
  }
}

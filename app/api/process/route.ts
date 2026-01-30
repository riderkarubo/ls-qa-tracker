import { NextRequest, NextResponse } from 'next/server';
import { parseInputCSV } from '@/lib/csvParser';
import { parseInputExcel } from '@/lib/excelParser';
import { parseQAText } from '@/lib/textParser';
import { integrateData } from '@/lib/dataIntegrator';
import { generateExcel } from '@/lib/excelGenerator';
import { getOutputFileName } from '@/lib/outputFileName';
import * as XLSX from 'xlsx';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const inputFile = formData.get('inputFile') as File;
    const qaTextFile = formData.get('qaTextFile') as File;

    if (!inputFile || !qaTextFile) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'ファイルが選択されていません',
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

    const qaText = await qaTextFile.text();
    const qaResult = parseQAText(qaText);

    if (qaResult.errors.length > 0) {
      inputErrors.push(...qaResult.errors);
    }

    // TODO: 新しいアーカイブ判定ロジックをここに実装
    // qaResult.qaItems を使用してアーカイブ判定を行う

    const integrated = await integrateData(inputQuestions, qaResult.qaItems);
    const outputQuestions = integrated.outputQuestions;

    const workbook = generateExcel(outputQuestions);
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true 
    });

    const outputFilename = getOutputFileName(qaTextFile.name);
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

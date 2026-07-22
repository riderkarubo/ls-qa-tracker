import type { InputQuestion } from '@/types';

interface HeaderIndexMap {
  answered: number;
  time: number;
  user: number;
  question: number;
  answerMethod: number;
}

const HEADER_MATCHERS: Record<keyof HeaderIndexMap, (cell: string) => boolean> = {
  answered: (cell) => cell.includes('回答済'),
  time: (cell) => cell.toLowerCase() === 'time',
  user: (cell) => cell.toLowerCase() === 'user',
  question: (cell) => cell.includes('質問'),
  answerMethod: (cell) => cell.includes('回答方法'),
};

function normalizeHeaderCell(cell: unknown): string {
  return (cell ?? '').toString().replace(/\s+/g, '');
}

function cellValue(row: string[], index: number): string {
  const raw = row[index];
  return raw === undefined || raw === null ? '' : raw.toString().trim();
}

interface HeaderMatch {
  headerIndex: number;
  columns: HeaderIndexMap;
}

// コメントピックアップシートはタイトル行の有無・列順が更新のたびに変わるため、
// 位置決め打ちではなくヘッダー名から列を都度検出する。
function findHeaderRow(rows: string[][], maxScanRows = 5): HeaderMatch | null {
  const scanLimit = Math.min(maxScanRows, rows.length);

  for (let i = 0; i < scanLimit; i++) {
    const row = rows[i];
    if (!row) continue;

    const normalizedRow = row.map(normalizeHeaderCell);
    const columns = {} as HeaderIndexMap;
    let matchedCount = 0;

    for (const key of Object.keys(HEADER_MATCHERS) as Array<keyof HeaderIndexMap>) {
      const index = normalizedRow.findIndex(HEADER_MATCHERS[key]);
      if (index !== -1) {
        columns[key] = index;
        matchedCount++;
      }
    }

    if (matchedCount === Object.keys(HEADER_MATCHERS).length) {
      return { headerIndex: i, columns };
    }
  }

  return null;
}

export interface MapRowsResult {
  questions: InputQuestion[];
  errors: string[];
}

export function mapRowsToInputQuestions(rows: string[][]): MapRowsResult {
  const header = findHeaderRow(rows);

  if (!header) {
    return {
      questions: [],
      errors: [
        'ヘッダー行が見つかりません（「回答済」「Time」「User」「質問」「回答方法」の列が必要です）',
      ],
    };
  }

  const { headerIndex, columns } = header;
  const dataRows = rows.slice(headerIndex + 1);
  const questions: InputQuestion[] = [];

  for (const row of dataRows) {
    if (!row) continue;

    const time = cellValue(row, columns.time);
    const question = cellValue(row, columns.question);

    if (!time || !question) continue;

    questions.push({
      answered: cellValue(row, columns.answered),
      time,
      user: cellValue(row, columns.user),
      question,
      answerMethod: cellValue(row, columns.answerMethod),
    });
  }

  return { questions, errors: [] };
}

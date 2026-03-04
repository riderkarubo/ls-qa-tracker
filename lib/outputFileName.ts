const BASE_NAME = '質問回答まとめ.xlsx';
const QA_DATE_PATTERN = /QA抽出_(\d{6})/;

/**
 * QA抽出テキストのファイル名（例: QA抽出_250123.txt）からYYMMDDを抽出し、
 * 出力Excelのファイル名を返す。
 * マッチしない場合は「質問回答まとめ.xlsx」を返す。
 */
export function getOutputFileName(qaTextFileName: string): string {
  const match = qaTextFileName.match(QA_DATE_PATTERN);
  if (match && match[1]) {
    return `${match[1]}${BASE_NAME}`;
  }
  return BASE_NAME;
}

const BASE_NAME = '質問回答まとめ.xlsx';
// YYYYMMDD（8桁）を先に試し、無ければYYMMDD（6桁）を試す。
// 8桁の後に6桁も現れるパターン（例: 20260817）で先頭6桁だけを誤って
// 切り出さないよう、8桁側を先に判定する。
const QA_DATE_PATTERN_8 = /QA抽出_(\d{8})/;
const QA_DATE_PATTERN_6 = /QA抽出_(\d{6})/;

/**
 * QA抽出テキストのファイル名（例: QA抽出_250123.txt / QA抽出_20260817.txt）
 * から日付を抽出し、出力Excelのファイル名を返す。
 * 8桁（YYYYMMDD）は先頭2桁（世紀）を落とし、プロジェクト標準のYYMMDD（6桁）に正規化する。
 * QA抽出テキストが未指定、またはマッチしない場合は「質問回答まとめ.xlsx」を返す。
 */
export function getOutputFileName(qaTextFileName?: string | null): string {
  if (!qaTextFileName) {
    return BASE_NAME;
  }

  const match8 = qaTextFileName.match(QA_DATE_PATTERN_8);
  if (match8 && match8[1]) {
    return `${match8[1].slice(2)}${BASE_NAME}`;
  }

  const match6 = qaTextFileName.match(QA_DATE_PATTERN_6);
  if (match6 && match6[1]) {
    return `${match6[1]}${BASE_NAME}`;
  }

  return BASE_NAME;
}

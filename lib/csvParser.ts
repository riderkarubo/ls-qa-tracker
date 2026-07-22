import Papa from 'papaparse';
import { mapRowsToInputQuestions } from '@/lib/inputRowMapper';
import type { InputQuestion } from '@/types';

export interface ParseCSVResult {
  questions: InputQuestion[];
  errors: string[];
}

export function parseInputCSV(csvContent: string): ParseCSVResult {
  const parsed = Papa.parse<string[]>(csvContent, {
    skipEmptyLines: true,
    header: false,
  });

  const parseErrors = parsed.errors.map((e) => e.message);
  const { questions, errors: mapErrors } = mapRowsToInputQuestions(parsed.data);

  return { questions, errors: [...parseErrors, ...mapErrors] };
}

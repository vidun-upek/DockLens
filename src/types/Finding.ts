export type Severity = 'error' | 'warning' | 'info' | 'off';

export interface Finding {
  ruleId: string;
  severity: Exclude<Severity, 'off'>;
  filePath?: string;
  line: number | null;
  message: string;
  suggestion?: string;
  snippet?: string;
  category?: string;
}

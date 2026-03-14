/**
 * Severity levels for findings
 * - 'error': Critical issues that must be fixed
 * - 'warning': Issues that should be fixed but won't block
 * - 'info': Informational suggestions
 * - 'off': Rule is disabled
 */
export type Severity = 'error' | 'warning' | 'info' | 'off';

/**
 * Represents a single finding (violation) found by a rule
 * Example: "no-latest-tag violation found on line 1"
 */
export interface Finding {
  /** The ID of the rule that found this violation (e.g., "no-latest-tag") */
  ruleId: string;
  
  /** The severity level (error, warning, or info) */
  severity: Exclude<Severity, 'off'>;
  
  /** Path to the file where this violation was found */
  filePath?: string;
  
  /** Line number of the violation (or null if not applicable) */
  line: number | null;
  
  /** Human-readable description of what's wrong */
  message: string;
  
  /** How to fix this issue */
  suggestion?: string;
  
  /** The actual line of code that has the issue */
  snippet?: string;
  
  /** Category of the issue (e.g., "security", "performance") */
  category?: string;
}

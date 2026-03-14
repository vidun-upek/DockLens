import chalk from 'chalk';
import type { Finding } from '../types/Finding';
import { colorizeSeverity } from '../utils/logger';

export interface AnalyzeResult {
	filePath: string;
	findings: Finding[];
}

export function formatResultsStylish(results: AnalyzeResult[]): string {
	const lines: string[] = [];
	let total = 0;
	for (const result of results) {
		if (result.findings.length === 0) {
			lines.push(chalk.green(`✔ ${result.filePath} - no findings`));
			continue;
		}

		lines.push(chalk.bold.underline(result.filePath));
		for (const finding of result.findings) {
			total += 1;
			lines.push(
				`[${colorizeSeverity(finding.severity)}] ${chalk.bold(finding.ruleId)}`
			);
			if (finding.line) lines.push(`  Line ${finding.line}`);
			lines.push(`  ${finding.message}`);
			if (finding.snippet) lines.push(`  ${chalk.gray(finding.snippet)}`);
			if (finding.suggestion) lines.push(`  Suggestion: ${finding.suggestion}`);
			lines.push('');
		}
	}
	lines.push(chalk.bold(`Total findings: ${total}`));
	return lines.join('\n');
}

export function formatResultsJson(results: AnalyzeResult[]): string {
	return JSON.stringify(results, null, 2);
}
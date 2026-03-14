import type { Finding } from '../types/Finding';
import type { Rule } from '../types/Rule';
import type { DockerfileContext } from '../types/DockerInstruction';
import type { LintConfig } from '../utils/config';

export function runRules(
	context: DockerfileContext,
	rules: Rule[],
 	config: LintConfig
): Finding[] {
	const findings: Finding[] = [];
	for (const rule of rules) {
		const override = config.rules[rule.meta.id] ?? rule.meta.defaultSeverity;
		if (override === 'off') continue;
		const results = rule.check(context).map((finding) => ({
			...finding,
			severity: override,
			category: rule.meta.category,
			suggestion: finding.suggestion || rule.meta.suggestion,
		}));
		findings.push(...results);
	}
	return findings.sort((a, b) => (a.line ?? 999999) - (b.line ?? 999999));
}
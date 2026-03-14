import type { Finding } from '../types/Finding';
import type { Rule } from '../types/Rule';
import type { DockerfileContext } from '../types/DockerInstruction';
import type { LintConfig } from '../utils/config';

/**
 * Run all rules against a parsed Dockerfile and collect findings
 * 
 * This function:
 * 1. Takes a parsed Dockerfile and all available rules
 * 2. Runs each rule's check function
 * 3. Applies severity overrides from config
 * 4. Filters out disabled rules (severity = 'off')
 * 5. Sorts findings by line number
 * 
 * @param context - The parsed Dockerfile to check
 * @param rules - Array of all available rules to run
 * @param config - Configuration that can override rule severities
 * @returns Array of all findings found, sorted by line number
 */
export function runRules(
	context: DockerfileContext,
	rules: Rule[],
 	config: LintConfig
): Finding[] {
	const findings: Finding[] = [];
	
	// Loop through each rule and run it
	for (const rule of rules) {
		// Check config for a severity override for this rule
		// If not overridden, use the rule's default severity
		const override = config.rules[rule.meta.id] ?? rule.meta.defaultSeverity;
		
		// If severity is 'off', skip this rule (it's disabled)
		if (override === 'off') continue;
		
		// Run the rule's check function to get findings
		const results = rule.check(context).map((finding) => ({
			...finding,
			// Apply the configured severity (e.g., change warning to error)
			severity: override,
			// Add rule metadata to the finding
			category: rule.meta.category,
			suggestion: finding.suggestion || rule.meta.suggestion,
		}));
		
		// Add all findings from this rule to the results
		findings.push(...results);
	}
	
	// Sort findings by line number (so output is in file order)
	// Findings without a line number go to the end
	return findings.sort((a, b) => (a.line ?? 999999) - (b.line ?? 999999));
}
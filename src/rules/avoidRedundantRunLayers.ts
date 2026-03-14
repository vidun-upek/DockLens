import type { Rule } from '../types/Rule';
import { createFinding } from './_helpers';

const SMALL_RUN = /^(mkdir|chmod|chown|echo|touch|ln|cp|mv)\b/i;

const rule: Rule = {
	meta: {
		id: 'avoid-redundant-run-layers',
		title: 'Avoid redundant RUN layers',
		description: 'Detects adjacent small RUN commands that could be combined.',
		whyItMatters: 'Combining related commands can reduce layers and make Dockerfiles cleaner.',
		suggestion: 'Combine related RUN commands with && when it improves readability.',
		defaultSeverity: 'info',
		category: 'caching'
	},
	check: (context) => {
		const findings = [];
		for (let i = 0; i < context.instructions.length - 1; i += 1) {
			const current = context.instructions[i];
			const next = context.instructions[i + 1];
			if (
				current.instruction === 'RUN' &&
				next.instruction === 'RUN' &&
				SMALL_RUN.test(current.argument) &&
				SMALL_RUN.test(next.argument)
			) {
				findings.push(
					createFinding(
						context,
						'avoid-redundant-run-layers',
						current,
						'Multiple adjacent small RUN instructions could likely be combined.',
						'Combine nearby simple RUN commands when it keeps the Dockerfile readable.'
					)
				);
			}
		}
		return findings;
	}
};

export default rule;
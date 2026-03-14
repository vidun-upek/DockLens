import type { Rule } from '../types/Rule';
import { SECRET_FILE_PATTERNS } from '../utils/patterns';
import { createFinding, getInstructionsBy } from './_helpers';

const rule: Rule = {
	meta: {
		id: 'avoid-copying-secrets',
		title: 'Avoid copying secrets into images',
		description: 'Warns when COPY or ADD references likely secret material.',
		whyItMatters: 'Secrets copied into images can leak through layers and registries.',
		suggestion: 'Use runtime secret injection or build secrets instead of copying sensitive files.',
		defaultSeverity: 'error',
		category: 'security'
	},
	check: (context) => {
		const findings = [];
		for (const instruction of [...getInstructionsBy(context, 'COPY'), ...getInstructionsBy(context, 'ADD')]) {
			if (SECRET_FILE_PATTERNS.some((pattern) => pattern.test(instruction.argument))) {
				findings.push(
					createFinding(
						context,
						'avoid-copying-secrets',
						instruction,
						'This copy instruction looks like it may include secret or credential material.',
						'Do not bake secrets into images. Exclude them with .dockerignore and inject them at runtime or with build secrets.'
					)
				);
			}
		}
		return findings;
	}
};

export default rule;
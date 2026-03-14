import type { Rule } from '../types/Rule';
import { createFinding, getInstructionsBy } from './_helpers';

const rule: Rule = {
	meta: {
		id: 'no-sudo-in-container',
		title: 'Do not use sudo in containers',
		description: 'Flags sudo usage inside RUN commands.',
		whyItMatters: 'sudo is usually unnecessary inside containers and often signals poor layering or user design.',
		suggestion: 'Run the command directly in the appropriate build stage or switch USER deliberately.',
		defaultSeverity: 'error',
		category: 'security'
	},
	check: (context) =>
		getInstructionsBy(context, 'RUN')
			.filter((instruction) => /\bsudo\b/i.test(instruction.argument))
			.map((instruction) =>
				createFinding(
					context,
					'no-sudo-in-container',
					instruction,
					'sudo is used inside the container build.',
					'Remove sudo and structure the Dockerfile around the correct build-time user instead.'
				)
			)
};

export default rule;
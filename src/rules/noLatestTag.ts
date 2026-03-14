import type { Rule } from '../types/Rule';
import { createFinding, getInstructionsBy } from './_helpers';

const rule: Rule = {
	meta: {
		id: 'no-latest-tag',
		title: 'Avoid latest tags',
		description: 'Flags FROM instructions that use the latest tag.',
		whyItMatters: 'latest changes over time and makes builds unpredictable.',
		suggestion: 'Use a pinned version such as node:20-alpine.',
		defaultSeverity: 'error',
		category: 'base-image'
	},
	check: (context) =>
		getInstructionsBy(context, 'FROM')
			.filter((instruction) => /:latest(\s+AS\s+\w+)?$/i.test(instruction.argument))
			.map((instruction) =>
				createFinding(
					context,
					'no-latest-tag',
					instruction,
					'Base image uses the latest tag, which is not reproducible.',
					'Pin the image to an explicit version such as node:20-alpine.'
				)
			)
};

export default rule;
import type { Rule } from '../types/Rule';
import { createFinding, getInstructionsBy } from './_helpers';

function addNeedsSpecialBehavior(argument: string): boolean {
	return /(https?:\/\/|\.tar|\.tgz|\.tar\.gz)/i.test(argument);
}

const rule: Rule = {
	meta: {
		id: 'prefer-copy-over-add',
		title: 'Prefer COPY over ADD',
		description: 'Warns when ADD is used without a clear need for its extra behavior.',
		whyItMatters: 'COPY is clearer and more predictable for most local file operations.',
		suggestion: 'Use COPY unless you intentionally need remote URLs or archive extraction.',
		defaultSeverity: 'warning',
		category: 'copy-context'
	},
	check: (context) =>
		getInstructionsBy(context, 'ADD')
			.filter((instruction) => !addNeedsSpecialBehavior(instruction.argument))
			.map((instruction) =>
				createFinding(
					context,
					'prefer-copy-over-add',
					instruction,
					'ADD is used where COPY would likely be clearer and safer.',
					'Replace ADD with COPY unless you intentionally rely on archive extraction or URL fetch behavior.'
				)
			)
};

export default rule;
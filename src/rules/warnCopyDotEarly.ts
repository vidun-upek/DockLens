import type { Rule } from '../types/Rule';
import { createFinding } from './_helpers';

const rule: Rule = {
	meta: {
		id: 'warn-copy-dot-early',
		title: 'Warn on early COPY . .',
		description: 'Warns when COPY . . appears very early in the Dockerfile.',
		whyItMatters: 'An early full-context copy harms cache efficiency and can copy too much too soon.',
		suggestion: 'Copy only the files needed for dependency resolution before copying the full source.',
		defaultSeverity: 'warning',
		category: 'copy-context'
	},
	check: (context) => {
		const copyAll = context.instructions.find((instruction, index) =>
			instruction.instruction === 'COPY' && /^\.\s+\.?\/?$/.test(instruction.argument.replace(/--[^ ]+\s+/g, '').trim()) && index <= 2
		);
		return copyAll
			? [
					createFinding(
						context,
						'warn-copy-dot-early',
						copyAll,
						'COPY . . appears very early in the Dockerfile.',
						'Move the full source copy later and copy only dependency manifests first.'
					)
				]
			: [];
	}
};

export default rule;
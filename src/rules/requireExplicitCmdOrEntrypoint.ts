import type { Rule } from '../types/Rule';
import { createFinding, getInstructionsBy } from './_helpers';

const rule: Rule = {
	meta: {
		id: 'require-explicit-cmd-or-entrypoint',
		title: 'Require explicit CMD or ENTRYPOINT',
		description: 'Warns when the Dockerfile does not define container startup behavior.',
		whyItMatters: 'Images are easier to understand and run when their entry behavior is explicit.',
		suggestion: 'Add a CMD or ENTRYPOINT instruction for the final container behavior.',
		defaultSeverity: 'warning',
		category: 'production'
	},
	check: (context) => {
		const hasCommand = getInstructionsBy(context, 'CMD').length > 0 || getInstructionsBy(context, 'ENTRYPOINT').length > 0;
		return hasCommand
			? []
			: [
					createFinding(
						context,
						'require-explicit-cmd-or-entrypoint',
						context.instructions[context.instructions.length - 1] ?? null,
						'No CMD or ENTRYPOINT instruction found.',
						'Add a CMD or ENTRYPOINT so the runtime behavior is explicit.'
					)
				];
	}
};

export default rule;
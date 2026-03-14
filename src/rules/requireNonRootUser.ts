import type { Rule } from '../types/Rule';
import { createFinding, getInstructionsBy } from './_helpers';

const rule: Rule = {
	meta: {
		id: 'require-non-root-user',
		title: 'Require a non-root runtime user',
		description: 'Warns when no USER instruction is present.',
		whyItMatters: 'Containers run as root by default, which increases risk.',
		suggestion: 'Create and switch to a non-root user before runtime.',
		defaultSeverity: 'warning',
		category: 'security'
	},
	check: (context) => {
		const users = getInstructionsBy(context, 'USER');
		if (users.length === 0) {
			return [
				createFinding(
					context,
					'require-non-root-user',
					context.instructions[context.instructions.length - 1] ?? null,
					'No USER instruction found. The container may run as root.',
					'Add a non-root USER instruction in the final runtime stage.'
				)
			];
		}

		const lastUser = users[users.length - 1];
		if (/^root$/i.test(lastUser.argument.trim())) {
			return [
				createFinding(
					context,
					'require-non-root-user',
					lastUser,
					'Final USER is explicitly set to root.',
					'Switch the runtime stage to a non-root user.'
				)
			];
		}

		return [];
	}
};

export default rule;
import type { Rule } from '../types/Rule';
import { createFinding, getInstructionsBy } from './_helpers';

/**
 * Rule: require-non-root-user
 * 
 * What it checks:
 * Makes sure the container runs as a non-root user
 * 
 * Why it matters:
 * By default, Docker containers run as the root user. This is a security risk
 * because if someone gets into the container, they have root access.
 * Best practice: Create a regular user and run the app as that user.
 * 
 * How to fix:
 * Add a USER instruction before CMD/ENTRYPOINT:
 * RUN useradd -m appuser
 * USER appuser
 * CMD ["app"]
 */
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
		// Find the last FROM instruction
		// In multi-stage builds, the last FROM marks the start of the final runtime stage
		// We only care about security in the final stage that gets shipped
		let lastFromIndex = -1;
		for (let i = context.instructions.length - 1; i >= 0; i--) {
			if (context.instructions[i].instruction === 'FROM') {
				lastFromIndex = i;
				break;  // Found the last FROM, stop looking
			}
		}

		// Get all USER instructions that come after the last FROM
		// These are the USER instructions that affect the final runtime
		const usersInFinalStage = context.instructions
			.slice(lastFromIndex + 1)  // Only look after the last FROM
			.filter((instruction) => instruction.instruction === 'USER');

		// Check 1: If no USER instruction exists, that's a problem
		if (usersInFinalStage.length === 0) {
			return [
				createFinding(
					context,
					'require-non-root-user',
					context.instructions[context.instructions.length - 1] ?? null,
					'No USER instruction found in the final stage. The container may run as root.',
					'Add a non-root USER instruction in the final runtime stage.'
				)
			];
		}

		// Check 2: Get the last USER instruction (that's the one that matters for runtime)
		// Even if there are multiple USER instructions, only the last one affects runtime
		const lastUser = usersInFinalStage[usersInFinalStage.length - 1];
		if (/^root$/i.test(lastUser.argument.trim())) {
			// The final user was explicitly set to root - this is a problem
			return [
				createFinding(
					context,
					'require-non-root-user',
					lastUser,
					'Final USER in the runtime stage is explicitly set to root.',
					'Switch the runtime stage to a non-root user.'
				)
			];
		}

		return [];
	}
};

export default rule;
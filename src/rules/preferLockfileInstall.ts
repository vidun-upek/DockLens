import type { Rule } from '../types/Rule';
import { createFinding, getInstructionsBy } from './_helpers';

const rule: Rule = {
	meta: {
		id: 'prefer-lockfile-install',
		title: 'Prefer lockfile-based installs',
		description: 'Encourages deterministic installs by copying and using lockfiles.',
		whyItMatters: 'Lockfiles make builds more reproducible.',
		suggestion: 'Copy your lockfile and use deterministic install commands.',
		defaultSeverity: 'warning',
		category: 'caching'
	},
	check: (context) => {
		const npmInstall = getInstructionsBy(context, 'RUN').find((instruction) => /npm\s+install/i.test(instruction.argument));
		const copiedLockfile = getInstructionsBy(context, 'COPY').some((instruction) => /(package-lock\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml)/i.test(instruction.argument));

		return npmInstall && !copiedLockfile
			? [
					createFinding(
						context,
						'prefer-lockfile-install',
						npmInstall,
						'Dependency install detected without an obvious lockfile copy step.',
						'Copy the lockfile before installation to keep dependency resolution deterministic.'
					)
				]
			: [];
	}
};

export default rule;
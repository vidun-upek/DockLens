import type { Rule } from '../types/Rule';
import { createFinding, getInstructionsBy } from './_helpers';

const rule: Rule = {
	meta: {
		id: 'use-npm-ci-in-ci-images',
		title: 'Prefer npm ci for CI or production-style builds',
		description: 'Suggests npm ci instead of npm install when a package-lock is likely being used.',
		whyItMatters: 'npm ci is faster and more deterministic for locked installs.',
		suggestion: 'Use npm ci when package-lock.json is available.',
		defaultSeverity: 'warning',
		category: 'caching'
	},
	check: (context) => {
		const copiedLockfile = getInstructionsBy(context, 'COPY').some((instruction) => /package-lock\.json/i.test(instruction.argument));
		if (!copiedLockfile) return [];

		return getInstructionsBy(context, 'RUN')
			.filter((instruction) => /npm\s+install(?![^-]*-g)/i.test(instruction.argument))
			.map((instruction) =>
				createFinding(
					context,
					'use-npm-ci-in-ci-images',
					instruction,
					'npm install is used even though a package-lock.json copy step exists.',
					'Use npm ci for deterministic installs in CI and production-style Docker builds.'
				)
			);
	}
};

export default rule;
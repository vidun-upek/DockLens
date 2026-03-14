import type { Rule } from '../types/Rule';
import { createFinding, getInstructionsBy } from './_helpers';

const rule: Rule = {
	meta: {
		id: 'no-dev-dependencies-in-runtime',
		title: 'Avoid development dependencies in runtime images',
		description: 'Warns when Node installs likely include development dependencies in the final image.',
		whyItMatters: 'Development dependencies bloat images and are not needed at runtime.',
		suggestion: 'Use `npm ci --omit=dev` or prune development dependencies in the runtime stage.',
		defaultSeverity: 'warning',
		category: 'production'
	},
	check: (context) => {
		const singleStage = getInstructionsBy(context, 'FROM').length === 1;
		const installStep = getInstructionsBy(context, 'RUN').find((instruction) => /npm\s+(ci|install)/i.test(instruction.argument));
		if (!installStep) return [];

		const safeNodeInstall = /--omit=dev|--only=production|npm\s+prune\s+--omit=dev/i.test(installStep.argument) ||
			context.instructions.some((instruction) => instruction.instruction === 'ENV' && /NODE_ENV\s*=\s*production/i.test(instruction.argument));

		return singleStage && !safeNodeInstall
			? [
					createFinding(
						context,
						'no-dev-dependencies-in-runtime',
						installStep,
						'Node dependencies may include development packages in the final runtime image.',
						'Use `npm ci --omit=dev`, `npm prune --omit=dev`, or a separate runtime stage.'
					)
				]
			: [];
	}
};

export default rule;

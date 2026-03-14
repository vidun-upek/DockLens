import type { Rule } from '../types/Rule';
import { createFinding, getInstructionsBy } from './_helpers';

const BUILD_TOOL_HINT = /(gcc|g\+\+|make|cmake|build-essential|cargo|rustc|go\s+build|npm\s+run\s+build|mvn\s+package|gradle\s+build)/i;

const rule: Rule = {
	meta: {
		id: 'suggest-multi-stage-build',
		title: 'Suggest multi-stage builds',
		description: 'Suggests a multi-stage build when build tooling appears to remain in a single final image.',
		whyItMatters: 'Multi-stage builds reduce final image size and keep runtime images cleaner.',
		suggestion: 'Use a builder stage and copy only final artifacts into the runtime stage.',
		defaultSeverity: 'warning',
		category: 'production'
	},
	check: (context) => {
		if (getInstructionsBy(context, 'FROM').length > 1) return [];
		const heavyBuildStep = getInstructionsBy(context, 'RUN').find((instruction) => BUILD_TOOL_HINT.test(instruction.argument));
		return heavyBuildStep
			? [
					createFinding(
						context,
						'suggest-multi-stage-build',
						heavyBuildStep,
						'Build tooling appears in a single-stage Dockerfile.',
						'Use a multi-stage build so the final runtime image contains only the artifacts you need.'
					)
				]
			: [];
	}
};

export default rule;
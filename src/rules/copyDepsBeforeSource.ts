import type { Rule } from '../types/Rule';
import { createFinding } from './_helpers';

const DEP_FILES = /(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|requirements\.txt|poetry\.lock|Pipfile\.lock|go\.mod|go\.sum|pom\.xml|build\.gradle)/i;
const INSTALL_CMD = /(npm\s+(ci|install)|pnpm\s+install|yarn\s+install|pip\s+install|poetry\s+install|go\s+mod\s+download|mvn\s+dependency:gooffline|gradle\s+build)/i;

const rule: Rule = {
	meta: {
		id: 'copy-deps-before-source',
		title: 'Copy dependency files before full source',
		description: 'Warns when dependency installation likely happens after copying the full source tree.',
		whyItMatters: 'Any source file change can invalidate the dependency cache layer.',
		suggestion: 'Copy lockfiles and manifest files first, install dependencies, then copy the remaining source.',
		defaultSeverity: 'warning',
		category: 'caching'
	},
	check: (context) => {
		const copyAllIndex = context.instructions.findIndex((instruction) =>
			instruction.instruction === 'COPY' && /^\.\s+\.?\/?$/.test(instruction.argument.replace(/--[^ ]+\s+/g, '').trim())
		);

		const installIndex = context.instructions.findIndex((instruction) =>
			instruction.instruction === 'RUN' && INSTALL_CMD.test(instruction.argument)
		);

		const depCopyExistsBeforeInstall = context.instructions.some((instruction, index) =>
			instruction.instruction === 'COPY' && DEP_FILES.test(instruction.argument) && index < installIndex
		);

		if (copyAllIndex !== -1 && installIndex !== -1 && copyAllIndex < installIndex && !depCopyExistsBeforeInstall) {
			return [
				createFinding(
					context,
					'copy-deps-before-source',
					context.instructions[copyAllIndex],
					'Full source is copied before dependency installation.',
					'Copy dependency manifests first, run the install step, then copy the rest of the source.'
				)
			];
		}

		return [];
	}
};

export default rule;
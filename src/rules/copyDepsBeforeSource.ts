import type { Rule } from '../types/Rule';
import { createFinding } from './_helpers';

const DEP_FILES = /(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|requirements\.txt|poetry\.lock|Pipfile\.lock|go\.mod|go\.sum|pom\.xml|build\.gradle)/i;
const INSTALL_CMD = /(npm\s+(ci|install)|pnpm\s+install|yarn\s+install|pip\s+install|poetry\s+install|go\s+mod\s+download|mvn\s+dependency:gooffline|gradle\s+build)/i;
const SOURCE_COPY = /(^\.\s+\.?\/?$|\bcopyall=true\b)/i;

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
		// Find the first instruction that copies full source (e.g., COPY . .)
		const sourceCopyIndex = context.instructions.findIndex((instruction) =>
			instruction.instruction === 'COPY' && 
			SOURCE_COPY.test(instruction.argument.replace(/--[^ ]+\s+/g, '').trim())
		);

		// Find the first dependency install command
		const installIndex = context.instructions.findIndex((instruction) =>
			instruction.instruction === 'RUN' && INSTALL_CMD.test(instruction.argument)
		);

		// Check if there are any dependency files copied before install
		const depCopyExistsBeforeInstall = context.instructions.some((instruction, index) =>
			instruction.instruction === 'COPY' && DEP_FILES.test(instruction.argument) && index < installIndex
		);

		// Flag if full source is copied before install and no dep files are copied first
		if (sourceCopyIndex !== -1 && installIndex !== -1 && sourceCopyIndex < installIndex && !depCopyExistsBeforeInstall) {
			return [
				createFinding(
					context,
					'copy-deps-before-source',
					context.instructions[sourceCopyIndex],
					'Full source is copied before dependency installation.',
					'Copy dependency manifests first, run the install step, then copy the rest of the source.'
				)
			];
		}

		return [];
	}
};

export default rule;
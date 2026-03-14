import type { Rule } from '../types/Rule';
import { createFinding } from './_helpers';

const rule: Rule = {
	meta: {
		id: 'require-dockerignore-hint',
		title: 'Recommend a .dockerignore file',
		description: 'Warns when a Dockerfile is present but no sibling .dockerignore exists.',
		whyItMatters: 'A .dockerignore prevents large or sensitive files from being sent to the build context.',
		suggestion: 'Add a .dockerignore that excludes node_modules, .git, logs, build outputs, and secrets.',
		defaultSeverity: 'warning',
		category: 'copy-context'
	},
	check: (context) =>
		context.hasDockerignore
			? []
			: [
					createFinding(
						context,
						'require-dockerignore-hint',
						context.instructions[0] ?? null,
						'No .dockerignore file was found next to this Dockerfile.',
						'Create a .dockerignore file to reduce build context size and accidental file leakage.'
					)
				]
};

export default rule;
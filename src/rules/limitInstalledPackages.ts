import type { Rule } from '../types/Rule';
import { PACKAGE_MANAGER_INSTALL_REGEX } from '../utils/patterns';
import { createFinding, getInstructionsBy } from './_helpers';

function countPackages(command: string): number {
	const normalized = command.replace(/\\\n/g, ' ');
	const match = normalized.match(/(?:apt-get\s+install|apk\s+add|yum\s+install|dnf\s+install)(?:\s+-[^\s]+)*\s+([^&;]+)/i);
	const segment = match?.[1];
	if (!segment) return 0;
	return segment.split(/\s+/).filter((part) => part && !part.startsWith('-') && part !== '\\').length;
}

const rule: Rule = {
	meta: {
		id: 'limit-installed-packages',
		title: 'Limit installed packages',
		description: 'Warns when a package manager install command appears to pull many packages at once.',
		whyItMatters: 'Large package sets increase image size and attack surface.',
		suggestion: 'Install only packages you truly need and prefer runtime-minimal images.',
		defaultSeverity: 'info',
		category: 'security'
	},
	check: (context) =>
		getInstructionsBy(context, 'RUN')
			.filter((instruction) => PACKAGE_MANAGER_INSTALL_REGEX.test(instruction.argument) && countPackages(instruction.argument) >= 8)
			.map((instruction) =>
				createFinding(
					context,
					'limit-installed-packages',
					instruction,
					'This package installation step appears to include many packages.',
					'Review whether all installed packages are necessary for the final image.'
				)
			)
};

export default rule;
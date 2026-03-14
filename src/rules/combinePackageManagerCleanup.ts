import type { Rule } from '../types/Rule';
import { PACKAGE_MANAGER_INSTALL_REGEX } from '../utils/patterns';
import { createFinding, getInstructionsBy } from './_helpers';

function missingCleanup(command: string): boolean {
	if (/apt-get\s+install/i.test(command)) return !/rm\s+-rf\s+\/var\/lib\/apt\/lists/.test(command);
	if (/apk\s+add/i.test(command)) return !/--no-cache/i.test(command);
	if (/yum\s+install|dnf\s+install/i.test(command)) return !/(yum|dnf)\s+clean\s+all/i.test(command);
	return false;
}

const rule: Rule = {
	meta: {
		id: 'combine-package-manager-cleanup',
		title: 'Clean package manager caches in the same layer',
		description: 'Warns when package manager caches are left behind.',
		whyItMatters: 'Leftover package indexes make images larger.',
		suggestion: 'Clean the package manager cache in the same RUN step.',
		defaultSeverity: 'warning',
		category: 'caching'
	},
	check: (context) =>
		getInstructionsBy(context, 'RUN')
			.filter((instruction) => PACKAGE_MANAGER_INSTALL_REGEX.test(instruction.argument) && missingCleanup(instruction.argument))
			.map((instruction) =>
				createFinding(
					context,
					'combine-package-manager-cleanup',
					instruction,
					'Package installation command appears to leave cache or package index files behind.',
					'For apt use `rm -rf /var/lib/apt/lists/*`, for apk use `--no-cache`, and for yum/dnf run `clean all`.'
				)
			)
};

export default rule;
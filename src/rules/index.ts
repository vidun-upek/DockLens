import type { Rule } from '../types/Rule';

// Import all active rules
// Each rule is a plugin that checks for specific Dockerfile issues
import noLatestTag from './noLatestTag';
import requireTaggedBaseImage from './requireTaggedBaseImage';
import copyDepsBeforeSource from './copyDepsBeforeSource';
import preferCopyOverAdd from './preferCopyOverAdd';
import requireNonRootUser from './requireNonRootUser';
import noCurlBash from './noCurlBash';
import requireExplicitCmdOrEntrypoint from './requireExplicitCmdOrEntrypoint';

/**
 * Array of all active rules
 * When the linter runs, it will check Dockerfiles against each of these rules
 * Total: 7 rules
 */
export const rules: Rule[] = [
	noLatestTag,                           // Check: BASE images should specify version
	requireTaggedBaseImage,                // Check: BASE images shouldn't be bare names
	copyDepsBeforeSource,                  // Check: Copy deps before copying all source
	preferCopyOverAdd,                     // Check: Use COPY instead of ADD when possible
	requireNonRootUser,                    // Check: Containers shouldn't run as root
	noCurlBash,                            // Check: Don't pipe curl | bash
	requireExplicitCmdOrEntrypoint         // Check: CMD or ENTRYPOINT must exist
];

/**
 * Helper function to find a rule by its ID
 * 
 * @param ruleId - The rule identifier (e.g., "no-latest-tag")
 * @returns The matching rule, or undefined if not found
 * 
 * Used by the "explain" command to show rule details
 */
export function findRuleById(ruleId: string): Rule | undefined {
	return rules.find((rule) => rule.meta.id === ruleId);
}
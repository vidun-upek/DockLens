import type { Rule } from '../types/Rule';
import noLatestTag from './noLatestTag';
import requireTaggedBaseImage from './requireTaggedBaseImage';
import preferSmallBaseImage from './preferSmallBaseImage';
import pinMajorMinorVersion from './pinMajorMinorVersion';
import copyDepsBeforeSource from './copyDepsBeforeSource';
import preferLockfileInstall from './preferLockfileInstall';
import useNpmCiInCiImages from './useNpmCiInCiImages';
import combinePackageManagerCleanup from './combinePackageManagerCleanup';
import avoidRedundantRunLayers from './avoidRedundantRunLayers';
import warnCopyDotEarly from './warnCopyDotEarly';
import requireDockerignoreHint from './requireDockerignoreHint';
import preferCopyOverAdd from './preferCopyOverAdd';
import avoidCopyingSecrets from './avoidCopyingSecrets';
import requireNonRootUser from './requireNonRootUser';
import noSudoInContainer from './noSudoInContainer';
import noCurlBash from './noCurlBash';
import limitInstalledPackages from './limitInstalledPackages';
import suggestMultiStageBuild from './suggestMultiStageBuild';
import noDevDependenciesInRuntime from './noDevDependenciesInRuntime';
import requireExplicitCmdOrEntrypoint from './requireExplicitCmdOrEntrypoint';
export const rules: Rule[] = [
noLatestTag,
requireTaggedBaseImage,
preferSmallBaseImage,
pinMajorMinorVersion,
copyDepsBeforeSource,
preferLockfileInstall,
useNpmCiInCiImages,
combinePackageManagerCleanup,
avoidRedundantRunLayers,
warnCopyDotEarly,
requireDockerignoreHint,
preferCopyOverAdd,
avoidCopyingSecrets,
requireNonRootUser,
noSudoInContainer,
noCurlBash,
limitInstalledPackages,
suggestMultiStageBuild,
noDevDependenciesInRuntime,
requireExplicitCmdOrEntrypoint
];
export function findRuleById(ruleId: string): Rule | undefined {
return rules.find((rule) => rule.meta.id === ruleId);
}
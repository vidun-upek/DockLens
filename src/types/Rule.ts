import type { DockerfileContext } from './DockerInstruction';
import type { Finding, Severity } from './Finding';
export interface RuleMeta {
id: string;
title: string;
description: string;
whyItMatters: string;
suggestion: string;
defaultSeverity: Severity;
category: 'base-image' | 'caching' | 'copy-context' | 'security' |
'production';
}
export interface Rule {
meta: RuleMeta;
check: (context: DockerfileContext) => Finding[];
}
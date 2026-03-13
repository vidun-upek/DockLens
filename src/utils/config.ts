import fs from 'node:fs';
import path from 'node:path';
import type { Severity } from '../types/Finding';
import { defaultConfig } from '../config/defaultRules';
export interface LintConfig {
failOn: Exclude<Severity, 'off'>[];
format: 'stylish' | 'json';
rules: Record<string, Severity>;
}
export function resolveConfigPath(explicitPath?: string): string | null {
if (explicitPath) return explicitPath;
const candidate = path.resolve(process.cwd(), 'dockerfile-lint-plus.config.json');
return fs.existsSync(candidate) ? candidate : null;
}
export function loadConfig(explicitPath?: string): LintConfig {
const configPath = resolveConfigPath(explicitPath);
if (!configPath) return defaultConfig;
const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8')) as
Partial<LintConfig>;
return {
failOn: parsed.failOn ?? defaultConfig.failOn,
format: parsed.format ?? defaultConfig.format,
rules: { ...defaultConfig.rules, ...(parsed.rules ?? {}) }
};
}
export function writeStarterConfig(destination = 'dockerfile-lint-plus.config.json'): void {
	fs.writeFileSync(destination, JSON.stringify(defaultConfig, null, 2) + '\n', 'utf8');
}
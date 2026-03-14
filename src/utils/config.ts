import fs from 'node:fs';
import path from 'node:path';
import type { Severity } from '../types/Finding';
import { defaultConfig } from '../config/defaultRules';

/**
 * Configuration for the linter
 * Controls which rules are enabled, how violations are reported, and what causes failure
 */
export interface LintConfig {
	/** Which severity levels should cause the CLI to exit with error code 1 (fail the build) */
	failOn: Exclude<Severity, 'off'>[];
	
	/** Output format: 'stylish' for human-readable or 'json' for automation */
	format: 'stylish' | 'json';
	
	/** Severity overrides for each rule (key: ruleId, value: severity or 'off' to disable) */
	rules: Record<string, Severity>;
}

/**
 * Find the config file to use
 * Looks for dockerfile-lint-plus.config.json in the current directory
 * Or uses the explicitly provided path if given
 * 
 * @param explicitPath - Optional path to config file (takes priority)
 * @returns Path to config file, or null if not found
 */
export function resolveConfigPath(explicitPath?: string): string | null {
	// If user explicitly provided a config path, use that
	if (explicitPath) return explicitPath;
	
	// Otherwise, look for config file in current directory
	const candidate = path.resolve(process.cwd(), 'dockerfile-lint-plus.config.json');
	return fs.existsSync(candidate) ? candidate : null;
}

/**
 * Load and parse the configuration file
 * Merges user config with defaults so we always have valid values
 * 
 * @param explicitPath - Optional explicit path to config file
 * @returns Merged configuration ready to use
 */
export function loadConfig(explicitPath?: string): LintConfig {
	// Try to find the config file
	const configPath = resolveConfigPath(explicitPath);
	
	// If no config file exists, use all defaults
	if (!configPath) return defaultConfig;
	
	try {
		// Read and parse the config file
		const fileContent = fs.readFileSync(configPath, 'utf8');
		const parsed = JSON.parse(fileContent) as Partial<LintConfig>;
		
		// Merge user config with defaults
		// This ensures that if user didn't specify something, we use the default
		return {
			failOn: parsed.failOn ?? defaultConfig.failOn,              // Which severities fail the build
			format: parsed.format ?? defaultConfig.format,              // Output format
			rules: { ...defaultConfig.rules, ...(parsed.rules ?? {}) }  // Rule severities (user overrides defaults)
		};
	} catch (error) {
		// If config loading fails (bad JSON, file error, etc.), warn user and use defaults
		const message = error instanceof Error ? error.message : String(error);
		console.warn(`⚠️  Failed to parse config file at ${configPath}: ${message}`);
		console.warn('Falling back to default configuration.\n');
		return defaultConfig;
}
}

/**
 * Create a starter configuration file
 * Used by the "init" command to generate a template config file
 * 
 * @param destination - Path where to write the config file (default: dockerfile-lint-plus.config.json)
 * 
 * This creates a JSON file with all default settings that users can customize
 */
export function writeStarterConfig(destination = 'dockerfile-lint-plus.config.json'): void {
	// Write the default config as formatted JSON to the destination file
	fs.writeFileSync(destination, JSON.stringify(defaultConfig, null, 2) + '\n', 'utf8');
}
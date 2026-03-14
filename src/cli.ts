#!/usr/bin/env node
/**
 * dockerfile-lint-plus CLI Entry Point
 * 
 * This is the main command-line interface for the Dockerfile linter.
 * It handles all user commands like "analyze", "rules", "explain", etc.
 */

import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import { parseDockerfile } from './analyzer/parseDockerfile';
import { runRules } from './analyzer/runRules';
import { formatResultsJson, formatResultsStylish, type AnalyzeResult } from './analyzer/resultFormatter';
import { rules, findRuleById } from './rules/index';
import { exists, isDirectory, walkForDockerfiles } from './utils/file';
import { loadConfig, writeStarterConfig } from './utils/config';

// Create the main CLI program
// Create the main CLI program
const program = new Command();

// Set up program name and description (shown when user runs --help)
program
	.name('dockerfile-lint-plus')
	.description('Lint Dockerfiles for security, reproducibility, performance, and maintainability.')
	.version('1.0.0');

// COMMAND 1: analyze - Check a Dockerfile for issues
// Example: dockerfile-lint-plus analyze Dockerfile
program
	.command('analyze')
	.argument('<target>', 'Dockerfile path or directory path')
	.option('-f, --format <format>', 'Output format: stylish or json')
	.option('-c, --config <path>', 'Path to config file')
	.option('-r, --recursive', 'Recursively scan directories for Dockerfiles', false)
	.option('--strict', 'Fail on warnings too', false)
	.action((target: string, options: { format?: 'stylish' | 'json'; config?: string; recursive?: boolean; strict?: boolean }) => {
		// Check if the target file or directory exists
		// If not, show error and exit with code 1 (error)
		// Check if the target file or directory exists
		// If not, show error and exit with code 1 (error)
		if (!exists(target)) {
			console.error(`Target not found: ${target}`);
			process.exit(1);
		}

		// Load the config file (if provided) or use default config
		const config = loadConfig(options.config);
		
		// If --strict flag is set, fail on both errors AND warnings
		if (options.strict) config.failOn = ['error', 'warning'];
		
		// If user specified a format, use that instead of the config format
		if (options.format) config.format = options.format;

		// Get list of files to analyze
		// If target is a directory, find all Dockerfiles in it (recursively if --recursive is set)
		// If target is a file, just use that one file
		const files = isDirectory(target)
			? walkForDockerfiles(path.resolve(target), options.recursive ?? false)
			: [path.resolve(target)];

		// If no Dockerfiles found, show error and exit
		if (files.length === 0) {
			console.error('No Dockerfiles found.');
			process.exit(1);
		}

		// Analyze each file:
		// 1. Parse the Dockerfile to extract instructions
		// 2. Run all rules against those instructions
		// 3. Collect findings (violations) for each file
		const results: AnalyzeResult[] = files.map((filePath) => {
			const context = parseDockerfile(filePath);
			const findings = runRules(context, rules, config);
			return { filePath, findings };
		});

		// Output the results in the requested format (JSON or human-readable)
		console.log(config.format === 'json' ? formatResultsJson(results) : formatResultsStylish(results));
		
		// Exit with error code (1) if any findings match the failOn severity list
		// This allows CI/CD pipelines to fail the build if violations are found
		const shouldFail = results.some((result) => result.findings.some((finding) => config.failOn.includes(finding.severity)));
		process.exit(shouldFail ? 1 : 0);
	});

// COMMAND 2: rules - List all available rules
// Example: dockerfile-lint-plus rules
program
	.command('rules')
	.description('List all available rules')
	.action(() => {
		// Loop through each rule and print its ID, severity, and title
		for (const rule of rules) {
			console.log(`${rule.meta.id} [${rule.meta.defaultSeverity}] - ${rule.meta.title}`);
		}
	});

// COMMAND 3: explain - Show detailed information about a specific rule
// Example: dockerfile-lint-plus explain no-latest-tag
program
	.command('explain')
	.argument('<ruleId>', 'Rule identifier')
	.description('Explain one rule')
	.action((ruleId: string) => {
		// Find the rule by its ID
		const rule = findRuleById(ruleId);
		
		// If rule doesn't exist, show error and exit
		if (!rule) {
			console.error(`Rule not found: ${ruleId}`);
			process.exit(1);
		}

		// Print detailed information about the rule
		console.log(`${rule.meta.id}\n`);
		console.log(rule.meta.title);
		console.log(`Severity: ${rule.meta.defaultSeverity}`);
		console.log(`Category: ${rule.meta.category}`);
		console.log(`\nWhat it checks:`);
		console.log(rule.meta.description);
		console.log(`\nWhy it matters:`);
		console.log(rule.meta.whyItMatters);
		console.log(`\nSuggestion:`);
		console.log(rule.meta.suggestion);
	});

// COMMAND 4: init - Create a starter config file
// Example: dockerfile-lint-plus init
program
	.command('init')
	.description('Create a starter config file')
	.action(() => {
		// Set up the destination path for the config file
		const destination = path.resolve(process.cwd(), 'dockerfile-lint-plus.config.json');
		
		// Check if config already exists (don't overwrite it)
		if (fs.existsSync(destination)) {
			console.error('dockerfile-lint-plus.config.json already exists.');
			process.exit(1);
		}

		// Write the starter config file
		writeStarterConfig(destination);
		console.log(`Created ${destination}`);
	});

// Parse all command-line arguments and run the appropriate command
program.parse();
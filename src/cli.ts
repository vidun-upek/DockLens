#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import { parseDockerfile } from './analyzer/parseDockerfile';
import { runRules } from './analyzer/runRules';
import { formatResultsJson, formatResultsStylish, type AnalyzeResult } from './analyzer/resultFormatter';
import { rules, findRuleById } from './rules/index';
import { exists, isDirectory, walkForDockerfiles } from './utils/file';
import { loadConfig, writeStarterConfig } from './utils/config';
const program = new Command();
program
	.name('dockerfile-lint-plus')
	.description('Lint Dockerfiles for security, reproducibility, performance, and maintainability.')
	.version('1.0.0');
program
	.command('analyze')
	.argument('<target>', 'Dockerfile path or directory path')
	.option('-f, --format <format>', 'Output format: stylish or json')
	.option('-c, --config <path>', 'Path to config file')
	.option('-r, --recursive', 'Recursively scan directories for Dockerfiles', false)
	.option('--strict', 'Fail on warnings too', false)
	.action((target: string, options: { format?: 'stylish' | 'json'; config?: string; recursive?: boolean; strict?: boolean }) => {
		if (!exists(target)) {
			console.error(`Target not found: ${target}`);
			process.exit(1);
		}

		const config = loadConfig(options.config);
		if (options.strict) config.failOn = ['error', 'warning'];
		if (options.format) config.format = options.format;

		const files = isDirectory(target)
			? walkForDockerfiles(path.resolve(target), options.recursive ?? false)
			: [path.resolve(target)];

		if (files.length === 0) {
			console.error('No Dockerfiles found.');
			process.exit(1);
		}

		const results: AnalyzeResult[] = files.map((filePath) => {
			const context = parseDockerfile(filePath);
			const findings = runRules(context, rules, config);
			return { filePath, findings };
		});

		console.log(config.format === 'json' ? formatResultsJson(results) : formatResultsStylish(results));
		const shouldFail = results.some((result) => result.findings.some((finding) => config.failOn.includes(finding.severity)));
		process.exit(shouldFail ? 1 : 0);
	});
program
	.command('rules')
	.description('List all available rules')
	.action(() => {
		for (const rule of rules) {
			console.log(`${rule.meta.id} [${rule.meta.defaultSeverity}] - ${rule.meta.title}`);
		}
	});

program
	.command('explain')
	.argument('<ruleId>', 'Rule identifier')
	.description('Explain one rule')
	.action((ruleId: string) => {
		const rule = findRuleById(ruleId);
		if (!rule) {
			console.error(`Rule not found: ${ruleId}`);
			process.exit(1);
		}

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
program
	.command('init')
	.description('Create a starter config file')
	.action(() => {
		const destination = path.resolve(process.cwd(), 'dockerfile-lint-plus.config.json');
		if (fs.existsSync(destination)) {
			console.error('dockerfile-lint-plus.config.json already exists.');
			process.exit(1);
		}

		writeStarterConfig(destination);
		console.log(`Created ${destination}`);
	});
program.parse();
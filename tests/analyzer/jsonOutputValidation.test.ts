import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseDockerfile } from '../../src/analyzer/parseDockerfile.js';
import { runRules } from '../../src/analyzer/runRules.js';
import { formatResultsJson, type AnalyzeResult } from '../../src/analyzer/resultFormatter.js';
import { rules } from '../../src/rules/index.js';
import { defaultConfig } from '../../src/config/defaultRules.js';

describe('JSON Output Validation', () => {
	it('produces valid JSON structure', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:latest\n');
		const context = parseDockerfile(filePath);
		const findings = runRules(context, rules, defaultConfig);
		const results: AnalyzeResult[] = [{ filePath, findings }];
		const json = formatResultsJson(results);

		const parsed = JSON.parse(json);
		expect(Array.isArray(parsed)).toBe(true);
		expect(parsed).toHaveLength(1);
		expect(parsed[0]).toHaveProperty('filePath');
		expect(Array.isArray(parsed[0].findings)).toBe(true);
	});

	it('findings have required fields', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:latest\nRUN sudo apt-get install curl\n');
		const context = parseDockerfile(filePath);
		const findings = runRules(context, rules, defaultConfig);
		const results: AnalyzeResult[] = [{ filePath, findings }];
		const json = formatResultsJson(results);

		const parsed = JSON.parse(json);
		const finding = parsed[0].findings[0];
		expect(finding).toHaveProperty('ruleId');
		expect(finding).toHaveProperty('severity');
		expect(finding).toHaveProperty('message');
		expect(finding).toHaveProperty('line');
	});

	it('correctly formats multiple files', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath1 = path.join(dir, 'Dockerfile1');
		const filePath2 = path.join(dir, 'Dockerfile2');
		fs.writeFileSync(filePath1, 'FROM node:latest\n');
		fs.writeFileSync(filePath2, 'FROM ubuntu:latest\n');

		const context1 = parseDockerfile(filePath1);
		const context2 = parseDockerfile(filePath2);
		const findings1 = runRules(context1, rules, defaultConfig);
		const findings2 = runRules(context2, rules, defaultConfig);
		const results: AnalyzeResult[] = [
			{ filePath: filePath1, findings: findings1 },
			{ filePath: filePath2, findings: findings2 }
		];
		const json = formatResultsJson(results);

		const parsed = JSON.parse(json);
		expect(Array.isArray(parsed)).toBe(true);
		expect(parsed).toHaveLength(2);
	});
});

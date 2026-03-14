import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseDockerfile } from '../../src/analyzer/parseDockerfile.js';
import rule from '../../src/rules/copyDepsBeforeSource.js';
describe('copyDepsBeforeSource rule', () => {
	it('flags when COPY . . happens before dependency install', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20\nCOPY . .\nRUN npm install\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(1);
		expect(findings[0].ruleId).toBe('copy-deps-before-source');
	});

	it('does not flag when package.json is copied first', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20\nCOPY package*.json ./\nRUN npm install\nCOPY . .\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(0);
	});

	it('does not flag when no full source copy exists', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20\nCOPY src/ ./src/\nRUN npm install\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(0);
	});

	it('does not flag when no install command is present', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20\nCOPY . .\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(0);
	});

	it('works with various package managers', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20\nCOPY . .\nRUN yarn install\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(1);
	});
});

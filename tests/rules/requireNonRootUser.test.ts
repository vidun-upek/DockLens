import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseDockerfile } from '../../src/analyzer/parseDockerfile.js';
import rule from '../../src/rules/requireNonRootUser.js';
describe('requireNonRootUser rule', () => {
	it('flags missing USER instruction', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20-alpine\nRUN npm install\nCMD ["node"]\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(1);
		expect(findings[0].ruleId).toBe('require-non-root-user');
	});

	it('does not flag when non-root USER is specified', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20-alpine\nRUN npm install\nUSER node\nCMD ["node"]\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(0);
	});

	it('flags when final USER is root', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20-alpine\nUSER appuser\nUSER root\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(1);
	});

	it('does not flag custom non-root user with numeric ID', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20-alpine\nRUN addgroup -S app && adduser -S app\nUSER 1000\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(0);
	});
});
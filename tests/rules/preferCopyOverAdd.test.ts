import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseDockerfile } from '../../src/analyzer/parseDockerfile.js';
import rule from '../../src/rules/preferCopyOverAdd.js';

describe('preferCopyOverAdd rule', () => {
	it('flags ADD for local files', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20\nADD local-file.txt /app/\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(1);
		expect(findings[0].ruleId).toBe('prefer-copy-over-add');
	});

	it('does not flag ADD for tar.gz archives', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20\nADD app.tar.gz /app/\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(0);
	});

	it('does not flag COPY', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20\nCOPY local-file.txt /app/\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(0);
	});

	it('flags ADD with txt extension', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20\nADD README.txt /app/\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(1);
	});

	it('does not flag ADD with tar extension', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20\nADD archive.tar /app/\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(0);
	});
});

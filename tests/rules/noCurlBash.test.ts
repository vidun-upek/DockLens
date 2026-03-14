import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseDockerfile } from '../../src/analyzer/parseDockerfile.js';
import rule from '../../src/rules/noCurlBash.js';

describe('noCurlBash rule', () => {
	it('flags curl piped to bash', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20\nRUN curl https://example.com/install.sh | bash\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(1);
		expect(findings[0].ruleId).toBe('no-curl-bash');
	});

	it('flags wget piped to bash', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20\nRUN wget https://example.com/install.sh | bash\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(1);
	});

	it('flags curl piped to sh', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20\nRUN curl https://example.com/install.sh | sh\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(1);
	});

	it('does not flag downloaded then executed script', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20\nRUN curl -O https://example.com/install.sh && bash install.sh\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(0);
	});

	it('does not flag regular curl usage', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20\nRUN curl -O https://example.com/file.tar.gz\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(0);
	});
});

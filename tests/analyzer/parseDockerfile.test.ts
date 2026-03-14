import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseDockerfile } from '../../src/analyzer/parseDockerfile.js';
describe('parseDockerfile', () => {
	it('parses instructions with line numbers', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20\nRUN npm ci\nCMD ["node"]\n');
		const result = parseDockerfile(filePath);
		expect(result.instructions).toHaveLength(3);
		expect(result.instructions[0].instruction).toBe('FROM');
		expect(result.instructions[1].line).toBe(2);
	});

	it('parses multiline instructions with backslash continuations', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		const dockerfileContent = `FROM node:20
RUN apt-get update && \\
	apt-get install -y \\
	curl \\
	git && \\
	rm -rf /var/lib/apt/lists/*
CMD ["node"]`;
		fs.writeFileSync(filePath, dockerfileContent);
		const result = parseDockerfile(filePath);
		expect(result.instructions).toHaveLength(3);
		expect(result.instructions[0].instruction).toBe('FROM');
		expect(result.instructions[1].instruction).toBe('RUN');
		// Verify multiline instruction is combined without literal newlines
		expect(result.instructions[1].argument).not.toContain('\n');
		expect(result.instructions[1].argument).toContain('apt-get update');
		expect(result.instructions[1].argument).toContain('curl');
		expect(result.instructions[1].argument).toContain('rm -rf');
		expect(result.instructions[2].instruction).toBe('CMD');
	});

	it('cleans backslashes and newlines from arguments', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		const dockerfileContent = `RUN npm install \\
	--production \\
	--no-save-dev`;
		fs.writeFileSync(filePath, dockerfileContent);
		const result = parseDockerfile(filePath);
		expect(result.instructions).toHaveLength(1);
		const arg = result.instructions[0].argument;
		expect(arg).not.toContain('\\');
		expect(arg).not.toContain('\n');
		expect(arg).toContain('npm install');
		expect(arg).toContain('--production');
	});
});
import fs from 'node:fs';
import path from 'node:path';
import type { DockerInstruction, DockerfileContext } from '../types/DockerInstruction';

function normalizeInstruction(line: string): string {
	return line.replace(/\s+/g, ' ').trim();
}

export function parseDockerfile(filePath: string): DockerfileContext {
	const content = fs.readFileSync(filePath, 'utf8');
	const lines = content.split(/\r?\n/);
	const instructions: DockerInstruction[] = [];
	let current = '';
	let startLine = 1;

	const flush = () => {
		const raw = current.trim();
		if (!raw || raw.startsWith('#')) {
			current = '';
			return;
		}
		const match = raw.match(/^([A-Z]+)\s+(.*)$/i);
		if (!match) {
			current = '';
			return;
		}
		const [, instruction, argument] = match;
		instructions.push({
			instruction: instruction.toUpperCase(),
			argument: argument.trim(),
			raw: normalizeInstruction(raw),
			line: startLine,
			original: raw,
		});
		current = '';
	};

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index];
		const trimmed = line.trim();
		if (!current && (!trimmed || trimmed.startsWith('#'))) continue;
		if (!current) startLine = index + 1;
		current += `${line}\n`;
		if (trimmed.endsWith('\\')) continue;
		flush();
	}

	if (current.trim()) flush();
	return {
		filePath,
		content,
		instructions,
		hasDockerignore: fs.existsSync(path.join(path.dirname(filePath), '.dockerignore')),
	};
}
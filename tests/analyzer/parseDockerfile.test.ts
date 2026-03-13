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
});
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseDockerfile } from '../../src/analyzer/parseDockerfile.js';
import { runRules } from '../../src/analyzer/runRules.js';
import { rules } from '../../src/rules/index.js';
import { defaultConfig } from '../../src/config/defaultRules.js';
describe('runRules', () => {
it('returns findings for a problematic Dockerfile', () => {
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
	const filePath = path.join(dir, 'Dockerfile');
	fs.writeFileSync(filePath, 'FROM node:latest\nCOPY . .\nRUN npm install\n');
const context = parseDockerfile(filePath);
const findings = runRules(context, rules, defaultConfig);
expect(findings.length).toBeGreaterThan(0);
	expect(findings.some((finding) => finding.ruleId === 'no-latest-tag')).toBe(true);
});
});
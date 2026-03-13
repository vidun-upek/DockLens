import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseDockerfile } from '../../src/analyzer/parseDockerfile.js';
import rule from '../../src/rules/noLatestTag.js';
describe('noLatestTag rule', () => {
it('flags latest tag usage', () => {
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
const filePath = path.join(dir, 'Dockerfile');
fs.writeFileSync(filePath, 'FROM node:latest\n');
const context = parseDockerfile(filePath);
const findings = rule.check(context);
expect(findings).toHaveLength(1);
expect(findings[0].ruleId).toBe('no-latest-tag');
});
});
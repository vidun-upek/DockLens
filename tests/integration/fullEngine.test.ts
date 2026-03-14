import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';
import { parseDockerfile } from '../../src/analyzer/parseDockerfile.js';
import { runRules } from '../../src/analyzer/runRules.js';
import { rules } from '../../src/rules/index.js';
import { defaultConfig } from '../../src/config/defaultRules.js';

describe('Integration Tests: Full Rule Engine', () => {
	const fixturesPath = path.join(process.cwd(), 'tests', 'fixtures', 'integration');

	describe('many-issues Dockerfile', () => {
		it('should detect multiple violations including no-latest-tag', () => {
			const filePath = path.join(fixturesPath, 'many-issues.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			expect(violations.length).toBeGreaterThanOrEqual(4);
			const ruleIds = violations.map((v) => v.ruleId);
			expect(ruleIds).toContain('no-latest-tag');
		});

		it('should detect prefer-copy-over-add violation', () => {
			const filePath = path.join(fixturesPath, 'many-issues.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			const ruleIds = violations.map((v) => v.ruleId);
			expect(ruleIds).toContain('prefer-copy-over-add');
		});

		it('should detect no-curl-bash violation', () => {
			const filePath = path.join(fixturesPath, 'many-issues.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			const ruleIds = violations.map((v) => v.ruleId);
			expect(ruleIds).toContain('no-curl-bash');
		});

		it('should include line numbers in findings', () => {
			const filePath = path.join(fixturesPath, 'many-issues.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			expect(violations.length).toBeGreaterThan(0);
			violations.forEach((violation) => {
				expect(violation.line).toBeGreaterThan(0);
				expect(typeof violation.line).toBe('number');
			});
		});
	});

	describe('production-ready Dockerfile', () => {
		it('should have no errors', () => {
			const filePath = path.join(fixturesPath, 'production-ready.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			const errors = violations.filter((v) => v.severity === 'error');
			expect(errors.length).toBe(0);
		});

		it('should have minimal or no warnings', () => {
			const filePath = path.join(fixturesPath, 'production-ready.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			// Allow up to 1 warning for flexibility
			const warnings = violations.filter((v) => v.severity === 'warning');
			expect(warnings.length).toBeLessThanOrEqual(1);
		});

		it('should pass all critical security checks', () => {
			const filePath = path.join(fixturesPath, 'production-ready.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			const ruleIds = violations.map((v) => v.ruleId);
			expect(ruleIds).not.toContain('no-latest-tag');
			expect(ruleIds).not.toContain('require-non-root-user');
			expect(ruleIds).not.toContain('no-curl-bash');
		});
	});

	describe('caching-issues Dockerfile', () => {
		it('should detect optimization opportunities', () => {
			const filePath = path.join(fixturesPath, 'caching-issues.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			// Should have at least some violations related to caching strategy
			expect(violations.length).toBeGreaterThan(0);
		});

		it('should have violations', () => {
			const filePath = path.join(fixturesPath, 'caching-issues.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			expect(violations.length).toBeGreaterThan(0);
		});
	});

	describe('security-issues Dockerfile', () => {
		it('should detect no-latest-tag violation', () => {
			const filePath = path.join(fixturesPath, 'security-issues.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			const ruleIds = violations.map((v) => v.ruleId);
			expect(ruleIds).toContain('no-latest-tag');
		});

		it('should detect no-curl-bash violation', () => {
			const filePath = path.join(fixturesPath, 'security-issues.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			const ruleIds = violations.map((v) => v.ruleId);
			expect(ruleIds).toContain('no-curl-bash');
		});

		it('should detect require-non-root-user violation', () => {
			const filePath = path.join(fixturesPath, 'security-issues.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			const ruleIds = violations.map((v) => v.ruleId);
			expect(ruleIds).toContain('require-non-root-user');
		});

		it('should have multiple violations', () => {
			const filePath = path.join(fixturesPath, 'security-issues.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			expect(violations.length).toBeGreaterThanOrEqual(3);
		});
	});

	describe('basic-issues Dockerfile', () => {
		it('should detect violations', () => {
			const filePath = path.join(fixturesPath, 'basic-issues.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			expect(violations.length).toBeGreaterThan(0);
		});

		it('should have readable findings', () => {
			const filePath = path.join(fixturesPath, 'basic-issues.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			violations.forEach((violation) => {
				expect(violation.ruleId).toBeDefined();
				expect(violation.message).toBeDefined();
				expect(violation.line).toBeGreaterThan(0);
				expect(violation.severity).toMatch(/error|warning|info/);
			});
		});
	});

	describe('fully-valid Dockerfile', () => {
		it('should have no errors', () => {
			const filePath = path.join(fixturesPath, 'fully-valid.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			const errors = violations.filter((v) => v.severity === 'error');
			expect(errors.length).toBe(0);
		});

		it('should have minimal violations', () => {
			const filePath = path.join(fixturesPath, 'fully-valid.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			// Allow up to 1 warning since even best practices may have minor suggestions
			expect(violations.length).toBeLessThanOrEqual(1);
		});
	});

	describe('Cross-Dockerfile Consistency', () => {
		it('should consistently detect rule violations across all Dockerfiles', () => {
			const testCases = [
				{ file: 'many-issues.Dockerfile', minViolations: 2 },
				{ file: 'production-ready.Dockerfile', maxViolations: 2 },
				{ file: 'caching-issues.Dockerfile', minViolations: 1 },
				{ file: 'security-issues.Dockerfile', minViolations: 2 },
				{ file: 'basic-issues.Dockerfile', minViolations: 1 },
				{ file: 'fully-valid.Dockerfile', maxViolations: 1 },
			];

			testCases.forEach(({ file, minViolations, maxViolations }) => {
				const filePath = path.join(fixturesPath, file);
				const context = parseDockerfile(filePath);
				const violations = runRules(context, rules, defaultConfig);

				if (minViolations !== undefined) {
					expect(violations.length).toBeGreaterThanOrEqual(minViolations);
				}
				if (maxViolations !== undefined) {
					expect(violations.length).toBeLessThanOrEqual(maxViolations);
				}
			});
		});
	});
});

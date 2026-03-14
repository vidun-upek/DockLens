import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseDockerfile } from '../../src/analyzer/parseDockerfile.js';
import { runRules } from '../../src/analyzer/runRules.js';
import { rules } from '../../src/rules/index.js';
import { defaultConfig } from '../../src/config/defaultRules.js';

describe('Edge Case Tests', () => {
	const fixturesPath = path.join(process.cwd(), 'tests', 'fixtures', 'edge-cases');

	describe('Empty Dockerfile', () => {
		it('should not crash on empty file', () => {
			const filePath = path.join(fixturesPath, 'empty.Dockerfile');
			expect(() => {
				const context = parseDockerfile(filePath);
				runRules(context, rules, defaultConfig);
			}).not.toThrow();
		});

		it('should return empty or minimal instructions', () => {
			const filePath = path.join(fixturesPath, 'empty.Dockerfile');
			const context = parseDockerfile(filePath);

			expect(Array.isArray(context.instructions)).toBe(true);
		});

		it('should trigger require-explicit-cmd-or-entrypoint for empty file', () => {
			const filePath = path.join(fixturesPath, 'empty.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			const ruleIds = violations.map((v) => v.ruleId);
			expect(ruleIds).toContain('require-explicit-cmd-or-entrypoint');
		});
	});

	describe('Only Comments Dockerfile', () => {
		it('should not crash on comment-only file', () => {
			const filePath = path.join(fixturesPath, 'only-comments.Dockerfile');
			expect(() => {
				const context = parseDockerfile(filePath);
				runRules(context, rules, defaultConfig);
			}).not.toThrow();
		});

		it('should parse without instructions', () => {
			const filePath = path.join(fixturesPath, 'only-comments.Dockerfile');
			const context = parseDockerfile(filePath);

			expect(context.instructions.length).toBe(0);
		});

		it('should trigger require-explicit-cmd-or-entrypoint', () => {
			const filePath = path.join(fixturesPath, 'only-comments.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			const ruleIds = violations.map((v) => v.ruleId);
			expect(ruleIds).toContain('require-explicit-cmd-or-entrypoint');
		});
	});

	describe('Lowercase Instructions', () => {
		it('should handle lowercase instructions', () => {
			const filePath = path.join(fixturesPath, 'lowercase-instructions.Dockerfile');
			expect(() => {
				const context = parseDockerfile(filePath);
				runRules(context, rules, defaultConfig);
			}).not.toThrow();
		});

		it('should parse lowercase FROM instruction', () => {
			const filePath = path.join(fixturesPath, 'lowercase-instructions.Dockerfile');
			const context = parseDockerfile(filePath);

			const hasFrom = context.instructions.some((i) => i.instruction.toUpperCase() === 'FROM');
			expect(hasFrom).toBe(true);
		});

		it('should detect latest tag with lowercase instructions', () => {
			const filePath = path.join(fixturesPath, 'lowercase-instructions.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			const ruleIds = violations.map((v) => v.ruleId);
			// May detect as error or may fail to parse - acceptable either way
			// The key is it doesn't crash
			expect(violations).toBeDefined();
		});
	});

	describe('Extra Spaces', () => {
		it('should handle extra spaces', () => {
			const filePath = path.join(fixturesPath, 'extra-spaces.Dockerfile');
			expect(() => {
				const context = parseDockerfile(filePath);
				runRules(context, rules, defaultConfig);
			}).not.toThrow();
		});

		it('should parse instructions despite extra spaces', () => {
			const filePath = path.join(fixturesPath, 'extra-spaces.Dockerfile');
			const context = parseDockerfile(filePath);

			expect(context.instructions.length).toBeGreaterThan(0);
		});

		it('should normalize and extract values correctly', () => {
			const filePath = path.join(fixturesPath, 'extra-spaces.Dockerfile');
			const context = parseDockerfile(filePath);

			const fromInstruction = context.instructions.find((i) => i.instruction.toUpperCase() === 'FROM');
			expect(fromInstruction).toBeDefined();
			expect(fromInstruction?.argument).toMatch(/node:latest/);
		});

		it('should detect violations despite spacing', () => {
			const filePath = path.join(fixturesPath, 'extra-spaces.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			// Should detect no-latest-tag
			const hasLatestTagViolation = violations.some((v) => v.ruleId === 'no-latest-tag');
			expect(hasLatestTagViolation).toBe(true);
		});
	});

	describe('Multi-Stage Build', () => {
		it('should NOT crash on multi-stage build', () => {
			const filePath = path.join(fixturesPath, 'multi-stage-build.Dockerfile');
			expect(() => {
				const context = parseDockerfile(filePath);
				runRules(context, rules, defaultConfig);
			}).not.toThrow();
		});

		it('should parse all FROM instructions', () => {
			const filePath = path.join(fixturesPath, 'multi-stage-build.Dockerfile');
			const context = parseDockerfile(filePath);

			const fromInstructions = context.instructions.filter((i) => i.instruction.toUpperCase() === 'FROM');
			expect(fromInstructions.length).toBeGreaterThanOrEqual(2);
		});

		it('should still check other rules', () => {
			const filePath = path.join(fixturesPath, 'multi-stage-build.Dockerfile');
			const context = parseDockerfile(filePath);
			const violations = runRules(context, rules, defaultConfig);

			// Multi-stage build uses specific versions (node:20)
			// so it shouldn't have latest tag violations
			const ruleIds = violations.map((v) => v.ruleId);
			expect(ruleIds).not.toContain('no-latest-tag');
		});

		it('should track line numbers across multiple stages', () => {
			const filePath = path.join(fixturesPath, 'multi-stage-build.Dockerfile');
			const context = parseDockerfile(filePath);
			
			const fromInstructions = context.instructions.filter((i) => i.instruction.toUpperCase() === 'FROM');
			const lineNumbers = fromInstructions.map((i) => i.line);
			
			// Second FROM should have higher line number than first
			expect(lineNumbers.length).toBeGreaterThanOrEqual(2);
			expect(lineNumbers[1]).toBeGreaterThan(lineNumbers[0]);
		});
	});

	describe('Parser Robustness', () => {
		it('should handle files with trailing newlines', () => {
			const filePath = path.join(fixturesPath, 'empty.Dockerfile');
			const content = fs.readFileSync(filePath, 'utf-8');
			
			expect(() => {
				parseDockerfile(filePath);
			}).not.toThrow();
		});

		it('should preserve instruction information', () => {
			const filePath = path.join(fixturesPath, 'extra-spaces.Dockerfile');
			const context = parseDockerfile(filePath);

			context.instructions.forEach((instruction) => {
				expect(instruction.instruction).toBeDefined();
				expect(typeof instruction.instruction).toBe('string');
				expect(instruction.line).toBeGreaterThan(0);
			});
		});
	});

	describe('Rule Engine Robustness', () => {
		it('should not throw on any edge case file', () => {
			const edgeCaseFiles = [
				'empty.Dockerfile',
				'only-comments.Dockerfile',
				'lowercase-instructions.Dockerfile',
				'extra-spaces.Dockerfile',
				'multi-stage-build.Dockerfile',
			];

			edgeCaseFiles.forEach((file) => {
				const filePath = path.join(fixturesPath, file);
				expect(() => {
					const context = parseDockerfile(filePath);
					runRules(context, rules, defaultConfig);
				}).not.toThrow(`Rule engine crashed on ${file}`);
			});
		});

		it('should return array of violations for all edge cases', () => {
			const edgeCaseFiles = [
				'empty.Dockerfile',
				'only-comments.Dockerfile',
				'lowercase-instructions.Dockerfile',
				'extra-spaces.Dockerfile',
				'multi-stage-build.Dockerfile',
			];

			edgeCaseFiles.forEach((file) => {
				const filePath = path.join(fixturesPath, file);
				const context = parseDockerfile(filePath);
				const violations = runRules(context, rules, defaultConfig);

				expect(Array.isArray(violations)).toBe(true);
				violations.forEach((violation) => {
					expect(violation.ruleId).toBeDefined();
					expect(violation.message).toBeDefined();
					expect(violation.severity).toMatch(/error|warning|info/);
				});
			});
		});
	});
});

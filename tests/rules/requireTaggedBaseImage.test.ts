import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseDockerfile } from '../../src/analyzer/parseDockerfile.js';
import rule from '../../src/rules/requireTaggedBaseImage.js';
describe('requireTaggedBaseImage rule', () => {
	it('flags untagged images', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(1);
		expect(findings[0].ruleId).toBe('require-tagged-base-image');
	});

	it('does not flag tagged images', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(0);
	});

	it('does not flag scratch', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM scratch\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(0);
	});

	it('does not flag images with @sha256: digest', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node@sha256:abc123\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(0);
	});

	it('does not flag registry URLs with tags', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM ghcr.io/org/repo:v1.0.0\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(0);
	});

	it('does not flag registry URLs with tag and digest', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM ghcr.io/org/repo:v1.0.0@sha256:abc123\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(0);
	});

	it('flags registry URLs without tags', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM ghcr.io/org/repo\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(1);
	});

	it('does not flag with AS clause', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dflp-'));
		const filePath = path.join(dir, 'Dockerfile');
		fs.writeFileSync(filePath, 'FROM node:20 AS builder\n');
		const context = parseDockerfile(filePath);
		const findings = rule.check(context);
		expect(findings).toHaveLength(0);
	});
});

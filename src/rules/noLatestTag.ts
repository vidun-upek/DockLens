import type { Rule } from '../types/Rule';
import { createFinding, getInstructionsBy } from './_helpers';

/**
 * Rule: no-latest-tag
 * 
 * What it checks:
 * Makes sure all FROM instructions use a specific version tag (not "latest")
 * Example: ❌ FROM node:latest  |  ✅ FROM node:20-alpine
 * 
 * Why it matters:
 * Using :latest tag makes Dockerfiles unpredictable. The "latest" tag changes
 * whenever someone pushes a new version. This means your build might work today
 * but fail tomorrow when a new version is released with breaking changes.
 * 
 * How to fix:
 * Replace "latest" with a specific version like "node:20-alpine"
 */
const rule: Rule = {
	meta: {
		id: 'no-latest-tag',
		title: 'Avoid latest tags',
		description: 'Flags FROM instructions that use the latest tag.',
		whyItMatters: 'latest changes over time and makes builds unpredictable.',
		suggestion: 'Use a pinned version such as node:20-alpine.',
		defaultSeverity: 'error',
		category: 'base-image'
	},
	// The check function: this is the actual rule logic
	check: (context) =>
		// Step 1: Get all FROM instructions in the Dockerfile
		getInstructionsBy(context, 'FROM')
			// Step 2: Filter to only those that use :latest tag
			// This regex looks for ":latest" with optional "AS name" after it
			.filter((instruction) => /:latest(\s+AS\s+\w+)?$/i.test(instruction.argument))
			// Step 3: For each violation found, create a Finding object
			.map((instruction) =>
				createFinding(
					context,
					'no-latest-tag',
					instruction,
					'Base image uses the latest tag, which is not reproducible.',
					'Pin the image to an explicit version such as node:20-alpine.'
				)
			)
};

export default rule;
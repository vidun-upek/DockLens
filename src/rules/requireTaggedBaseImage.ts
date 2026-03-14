import type { Rule } from '../types/Rule';
import { createFinding, getInstructionsBy } from './_helpers';

const rule: Rule = {
	meta: {
		id: 'require-tagged-base-image',
		title: 'Require tagged base image',
		description: 'Flags FROM instructions without an explicit tag.',
		whyItMatters: 'Unversioned images can silently change over time.',
		suggestion: 'Use an explicit image tag such as python:3.12-slim.',
		defaultSeverity: 'error',
		category: 'base-image'
	},
	check: (context) =>
		getInstructionsBy(context, 'FROM')
			.filter((instruction) => {
				const image = instruction.argument.split(/\s+AS\s+/i)[0].trim();
				if (image === 'scratch' || image.includes('@sha256:') || /@[a-z0-9]+:/i.test(image)) return false;
				// Check if there's a tag (colon not used for registry port)
				const hasTag = /:[^/:]+$/.test(image);
				return !hasTag;
			})
			.map((instruction) =>
				createFinding(
					context,
					'require-tagged-base-image',
					instruction,
					'Base image does not specify an explicit tag.',
					'Add a version tag such as node:20-alpine or python:3.12-slim.'
				)
			)
};

export default rule;
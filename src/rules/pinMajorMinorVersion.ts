import type { Rule } from '../types/Rule';
import { createFinding, getInstructionsBy } from './_helpers';

function isBroadTag(image: string): boolean {
	const parts = image.split(':');
	if (parts.length < 2) return true; // no tag present
	const tag = parts.slice(1).join(':');
	// Consider a tag broad when it only specifies major version (e.g. "3" or "3-alpine").
	return /^\d+$/.test(tag) || /^\d+-(alpine|slim)$/.test(tag);
}

const rule: Rule = {
	meta: {
		id: 'pin-major-minor-version',
		title: 'Pin major and minor versions',
		description: 'Warns when the image tag is too broad.',
		whyItMatters: 'A broad tag still changes over time.',
		suggestion: 'Pin to a more specific tag such as python:3.12-slim.',
		defaultSeverity: 'warning',
		category: 'base-image'
	},
	check: (context) =>
		getInstructionsBy(context, 'FROM')
			.filter((instruction) => isBroadTag(instruction.argument.split(/\s+AS\s+/i)[0].trim()))
			.map((instruction) =>
				createFinding(
					context,
					'pin-major-minor-version',
					instruction,
					'Base image tag is broad and may resolve to different patch versions later.',
					'Pin to a major.minor tag or digest for stronger reproducibility.'
				)
			)
};

export default rule;
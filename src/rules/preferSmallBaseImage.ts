import type { Rule } from '../types/Rule';
import { LIGHTWEIGHT_BASE_IMAGE_HINTS } from '../utils/patterns';
import { createFinding, getInstructionsBy } from './_helpers';
const rule: Rule = {
meta: {
id: 'prefer-small-base-image',
title: 'Prefer smaller base images',
description:
'Suggests smaller base images where a lighter alternative is available.',
whyItMatters: 'Smaller images pull faster and reduce attack surface.',
suggestion: 'Consider an alpine or slim variant when compatible.',
defaultSeverity: 'info',
category: 'base-image'
},
check: (context) => {
const findings = [];
for (const instruction of getInstructionsBy(context, 'FROM')) {
const image = instruction.argument.split(/\s+AS\s+/i)[0].trim();
const baseName = image.split('/').pop()?.split(':')[0] ?? image;
const hint = LIGHTWEIGHT_BASE_IMAGE_HINTS[baseName];
if (!hint || /alpine|slim/i.test(image)) continue;
findings.push(createFinding(context, 'prefer-small-base-image',
instruction, `Base image ${image} may have a smaller alternative.`,
`Consider a lighter option such as ${hint} when compatible.`));
}
return findings;
}
};
export default rule;
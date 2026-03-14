import type { Rule } from '../types/Rule';
import { CURL_BASH_REGEX } from '../utils/patterns';
import { createFinding, getInstructionsBy } from './_helpers';

const rule: Rule = {
    meta: {
        id: 'no-curl-bash',
        title: 'Do not pipe curl or wget into a shell',
        description: 'Flags remote shell execution patterns like `curl ... | bash`.',
        whyItMatters: 'This is a risky remote code execution pattern and reduces auditability.',
        suggestion: 'Download artifacts explicitly, verify them, and run trusted local files instead.',
        defaultSeverity: 'error',
        category: 'security'
    },
    check: (context) =>
        getInstructionsBy(context, 'RUN')
            .filter((instruction) => CURL_BASH_REGEX.test(instruction.argument))
            .map((instruction) =>
                createFinding(
                    context,
                    'no-curl-bash',
                    instruction,
                    'Remote script content is piped directly into a shell.',
                    'Download the script or artifact, verify its integrity, and execute it explicitly.'
                )
            )
};

export default rule;
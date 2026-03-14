import type { DockerInstruction, DockerfileContext } from '../types/DockerInstruction';
import type { Finding } from '../types/Finding';

export function createFinding(
  context: DockerfileContext,
  ruleId: string,
  instruction: DockerInstruction | null,
  message: string,
  suggestion?: string
): Finding {
  return {
    ruleId,
    severity: 'warning',
    filePath: context.filePath,
    line: instruction?.line ?? null,
    message,
    suggestion: suggestion ?? '',
    snippet: instruction?.raw
  };
}

export function getInstructionsBy(context: DockerfileContext, name: string): DockerInstruction[] {
  return context.instructions.filter(
    (instruction) => instruction.instruction === name.toUpperCase()
  );
}

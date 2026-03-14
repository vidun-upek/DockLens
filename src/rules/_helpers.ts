import type { DockerInstruction, DockerfileContext } from '../types/DockerInstruction';
import type { Finding } from '../types/Finding';

/**
 * Helper function to create a Finding (violation) object
 * This is used by all rules to report issues they find
 * 
 * @param context - The parsed Dockerfile being checked
 * @param ruleId - The ID of the rule that found this violation
 * @param instruction - The instruction that has the violation (or null if not line-specific)
 * @param message - Human-readable description of the problem
 * @param suggestion - How to fix this issue
 * @returns A Finding object representing this violation
 */
export function createFinding(
  context: DockerfileContext,
  ruleId: string,
  instruction: DockerInstruction | null,
  message: string,
  suggestion?: string
): Finding {
  return {
    ruleId,
    severity: 'warning',  // Note: CLI can override this with config
    filePath: context.filePath,
    line: instruction?.line ?? null,           // Line number (null if not applicable)
    message,
    suggestion: suggestion ?? '',              // How to fix it
    snippet: instruction?.raw                  // The actual code that has the issue
  };
}

/**
 * Helper function to find all instructions of a specific type in a Dockerfile
 * 
 * @param context - The parsed Dockerfile
 * @param name - The instruction name to search for (e.g., "FROM", "RUN", "COPY")
 * @returns Array of matching instructions
 * 
 * Example:
 * getInstructionsBy(context, 'FROM')  // Get all FROM instructions
 * getInstructionsBy(context, 'RUN')   // Get all RUN instructions
 */
export function getInstructionsBy(context: DockerfileContext, name: string): DockerInstruction[] {
  return context.instructions.filter(
    (instruction) => instruction.instruction === name.toUpperCase()
  );
}

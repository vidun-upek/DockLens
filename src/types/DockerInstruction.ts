/**
 * Represents a single instruction in a Dockerfile
 * Example: "FROM node:20-alpine" is one instruction
 */
export interface DockerInstruction {
    /** The instruction type in uppercase (e.g., "FROM", "RUN", "COPY") */
    instruction: string;
    
    /** The argument/content for this instruction (e.g., "node:20-alpine") */
    argument: string;
    
    /** The normalized instruction line (with extra spaces removed) */
    raw: string;
    
    /** The line number where this instruction appears (1-based) */
    line: number;
    
    /** The original instruction text exactly as it appeared in the file */
    original: string;
}

/**
 * Represents the entire parsed Dockerfile
 * Contains all instructions and metadata about the file
 */
export interface DockerfileContext {
    /** Absolute file path to the Dockerfile */
    filePath: string;
    
    /** The complete content of the Dockerfile as a string */
    content: string;
    
    /** Array of all parsed instructions in order */
    instructions: DockerInstruction[];
    
    /** Whether a .dockerignore file exists in the same directory */
    hasDockerignore: boolean;
}
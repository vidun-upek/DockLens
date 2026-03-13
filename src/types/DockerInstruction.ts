export interface DockerInstruction {
    instruction: string;
    argument: string;
    raw: string;
    line: number;
    original: string;
}
export interface DockerfileContext {
    filePath: string;
    content: string;
    instructions: DockerInstruction[];
    hasDockerignore: boolean;
}
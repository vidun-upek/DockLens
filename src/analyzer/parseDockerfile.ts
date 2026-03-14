import fs from 'node:fs';
import path from 'node:path';
import type { DockerInstruction, DockerfileContext } from '../types/DockerInstruction';

/**
 * Clean up a Dockerfile line by removing line continuations and extra spaces
 * In Docker, a backslash (\) at the end of a line means the next line continues the instruction
 * This function joins those lines together for easier parsing
 */
function normalizeInstruction(line: string): string {
	return line
		.replace(/\\\n/g, ' ') // Replace backslash-newline with space (removes line continuations)
		.replace(/\s+/g, ' ')  // Replace multiple spaces with single space
		.trim();               // Remove leading/trailing whitespace
}

/**
 * Clean up instruction arguments by handling line continuations
 * Arguments are the part after the instruction keyword
 * Example: In "FROM node:20", the argument is "node:20"
 */
function cleanArgument(arg: string): string {
	return arg
		.replace(/\\\n/g, ' ') // Remove line continuations with preceding space
		.trim();               // Remove leading/trailing whitespace
}

/**
 * Parse a Dockerfile and extract all instructions
 * Returns a DockerfileContext with the parsed instructions and metadata
 * 
 * This function:
 * 1. Reads the file content
 * 2. Splits it into lines
 * 3. Identifies each instruction (FROM, RUN, COPY, etc.)
 * 4. Extracts the arguments for each instruction
 * 5. Tracks line numbers for good error reporting
 */
export function parseDockerfile(filePath: string): DockerfileContext {
	const content = fs.readFileSync(filePath, 'utf8');  // Read file content
	const lines = content.split(/\r?\n/);               // Split into lines (handles Windows and Unix line endings)
	const instructions: DockerInstruction[] = [];       // Array to store parsed instructions
	let current = '';                                   // Buffer for current instruction being built
	let startLine = 1;                                  // Track which line an instruction starts on

	/**
	 * Helper function to finish parsing the current instruction
	 * Called when we've collected all lines for an instruction
	 */
	const flush = () => {
		const raw = current.trim();
		
		// Skip empty lines and comments
		if (!raw || raw.startsWith('#')) {
			current = '';
			return;
		}
		
		// Extract the instruction type and argument using regex
		// Format: INSTRUCTION argument
		// The regex matches an uppercase word followed by the rest of the line
		const match = raw.match(/^([A-Z]+)\s+(.*)$/is);
		if (!match) {
			current = '';
			return;
		}
		
		// Extract instruction and argument from regex match
		const [, instruction, argument] = match;
		
		// Store the parsed instruction
		instructions.push({
			instruction: instruction.toUpperCase(),      // Ensure instruction is uppercase
			argument: cleanArgument(argument),           // Clean up the argument
			raw: normalizeInstruction(raw),              // Normalized version
			line: startLine,                             // Line number where it starts
			original: raw,                               // Original text
		});
		current = '';
	};

	// Main parsing loop: go through each line in the file
	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index];
		const trimmed = line.trim();
		
		// Skip blank lines and comments if we haven't started an instruction yet
		if (!current && (!trimmed || trimmed.startsWith('#'))) continue;
		
		// If this is the first line of an instruction, remember which line it is
		if (!current) startLine = index + 1;
		
		// Add this line to the current instruction being built
		current += `${line}\n`;
		
		// If this line ends with a backslash, it continues on the next line
		// So don't flush yet; wait for more lines
		if (trimmed.endsWith('\\')) continue;
		
		// Otherwise, we're done with this instruction, so flush it
		flush();
	}

	// Handle any remaining instruction that wasn't flushed
	if (current.trim()) flush();
	
	// Return the parsed Dockerfile
	return {
		filePath,
		content,
		instructions,
		hasDockerignore: fs.existsSync(path.join(path.dirname(filePath), '.dockerignore')),
	};
}
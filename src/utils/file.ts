import fs from 'node:fs';
import path from 'node:path';
export function exists(filePath: string): boolean {
return fs.existsSync(filePath);
}
export function isDirectory(targetPath: string): boolean {
return fs.statSync(targetPath).isDirectory();
}
export function walkForDockerfiles(dirPath: string, recursive: boolean):
string[] {
const results: string[] = [];
const entries = fs.readdirSync(dirPath, { withFileTypes: true });
for (const entry of entries) {
if (['node_modules', '.git', 'dist'].includes(entry.name)) continue;
const fullPath = path.join(dirPath, entry.name);
if (entry.isDirectory()) {
if (recursive) results.push(...walkForDockerfiles(fullPath, true));
continue;
}
if (entry.name === 'Dockerfile' ||
entry.name.toLowerCase().startsWith('dockerfile')) {
results.push(fullPath);
}
}
return results;
}
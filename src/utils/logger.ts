import chalk from 'chalk';
import type { Severity } from '../types/Finding';
export function colorizeSeverity(severity: Severity): string {
switch (severity) {
case 'error':
return chalk.red.bold('ERROR');
case 'warning':
return chalk.yellow.bold('WARNING');
case 'info':
return chalk.blue.bold('INFO');
default:
return severity.toUpperCase();
}
}
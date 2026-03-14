import type { DockerfileContext } from './DockerInstruction';
import type { Finding, Severity } from './Finding';

/**
 * Metadata that describes a rule
 * Includes what it checks, why it matters, and how to fix it
 */
export interface RuleMeta {
    /** Unique identifier for this rule (e.g., "no-latest-tag") */
    id: string;
    
    /** Short human-readable title of what this rule checks */
    title: string;
    
    /** Detailed explanation of what this rule detects */
    description: string;
    
    /** Why this rule matters and what problems it prevents */
    whyItMatters: string;
    
    /** How to fix violations of this rule */
    suggestion: string;
    
    /** Default severity level for this rule */
    defaultSeverity: Severity;
    
    /** Category that this rule belongs to (helps organize rules) */
    category: 'base-image' | 'caching' | 'copy-context' | 'security' | 'production';
}

/**
 * Represents a linting rule
 * Each rule checks for specific Dockerfile issues
 */
export interface Rule {
    /** Information about this rule */
    meta: RuleMeta;
    
    /**
     * The actual rule logic
     * Takes a parsed Dockerfile and returns any violations it finds
     * 
     * Example: noLatestTag rule checks if "FROM" lines use :latest tag
     */
    check: (context: DockerfileContext) => Finding[];
}
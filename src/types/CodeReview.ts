export type SeverityLevel = 'info' | 'warning' | 'critical';

export interface CodeIssue {
    line: number;
    level: SeverityLevel;
    message: string;
    rule?: string;
}

export interface CodeAnalyzerResult {
    functions: string[];
    ifWithFixedValue: CodeIssue[];
    ifWithoutCurlyBraces: CodeIssue[];
    variableDeclaredButNotUsed: CodeIssue[];
    evalUsage: CodeIssue[];
}
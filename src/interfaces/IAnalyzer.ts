import { CodeIssue } from '../types/CodeReview';

export interface IFunctionAnalyzer {
    analyze(code: string): string[];
    getType(): 'functions';
}

export interface ICodeAnalyzer {
    analyze(code: string): CodeIssue[];
    getType(): 'ifWithFixedValue' | 'ifWithoutCurlyBraces' | 'evalUsage';
}
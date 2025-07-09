import { ICodeAnalyzer } from '../interfaces/IAnalyzer';
import { CodeIssue } from '../types/CodeReview';

export class EvalAnalyzer implements ICodeAnalyzer {
    getType(): 'evalUsage' {
        return 'evalUsage';
    }

    analyze(code: string): CodeIssue[] {
        const results: CodeIssue[] = [];
        const evalRegex = /\beval\s*\(/g;
        
        const lines = code.split('\n').map(line => line.trim());
        lines.forEach((line, index) => {
            if (evalRegex.test(line)) {
                results.push({
                    line: index + 1,
                    level: 'critical',
                    message: `Eval usage detected: ${line.trim()}`,
                    rule: 'no-eval'
                });
            }
        });

        return results;
    }
}
import { ICodeAnalyzer } from '../interfaces/IAnalyzer';
import { CodeIssue } from '../types/CodeReview';

export class CurlyBracesAnalyzer implements ICodeAnalyzer {
    private readonly SEVERITY = 'critical';
    private readonly RULE = 'curly-braces-required';

    getType(): 'ifWithoutCurlyBraces' {
        return 'ifWithoutCurlyBraces';
    }

    analyze(code: string): CodeIssue[] {
        const results: CodeIssue[] = [];
        const ifNoCurlyRegex = /^\s*if\s*\(.*\)\s*(?!\{)/;
        
        const lines = code.split('\n').map(line => line.trim());
        lines.forEach((line, index) => {
            const match = line.match(/^\s*if\s*\(.*\)\s*({)?/);
            if (match && !match[1]) {
                results.push({
                    line: index + 1,
                    level: this.SEVERITY,
                    message: `Missing curly braces: ${line.trim()}`,
                    rule: this.RULE
                });
            }
        });

        return results;
    }
}
import { ICodeAnalyzer } from '../interfaces/IAnalyzer';
import { CodeIssue } from '../types/CodeReview';

export class FixedValueAnalyzer implements ICodeAnalyzer {
    private readonly SEVERITY = 'critical';
    private readonly RULE = 'no-fixed-if-values';

    getType(): 'ifWithFixedValue' {
        return 'ifWithFixedValue';
    }

    analyze(code: string): CodeIssue[] {
        const results: CodeIssue[] = [];
        const ifFixedValueRegex = /if\s*\(\s*([a-zA-Z_][\w]*)\s*([=!]=+)\s*(\d+|'.*?'|".*?")\s*\)/gi;
        
        const lines = code.split('\n').map(line => line.trim());
        lines.forEach((line, index) => {
            let match;
            while ((match = ifFixedValueRegex.exec(line)) !== null) {
                results.push({
                    line: index + 1,
                    level: this.SEVERITY,
                    message: `Fixed value in if-statement: if(${match[1]} ${match[2]} ${match[3]})`,
                    rule: this.RULE
                });
            }
        });

        return results;
    }
}
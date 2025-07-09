import { log } from "console";
import { fileHandler } from "./FileHandler";
import * as fs from "fs";
import { CodeIssue, SeverityLevel, CodeAnalyzerResult } from "./types/CodeReview";

export class FunctionHandler {
    private readonly SEVERITY = {
        CRITICAL: 'critical' as SeverityLevel,
        WARNING: 'warning' as SeverityLevel,
        INFO: 'info' as SeverityLevel
    };

    private readonly RULES = {
        NO_FIXED_VALUES: 'no-fixed-if-values',
        CURLY_BRACES: 'curly-braces-required',
        NO_EVAL: 'no-eval',
        NO_UNUSED_VARS: 'no-unused-vars'
    };

    constructor() {}


    private extractFunctions(context: string): string[] {
        const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)\s*{([\s\S]*?)}/g;
        const functions: Array<{name: string, parameters: string[], body: string}> = [];
        
        let match;
        while ((match = functionRegex.exec(context)) !== null) {
            functions.push({
                name: match[1],
                parameters: match[2].split(',').map(param => param.trim()),
                body: match[3].trim()
            });
        }

        if (functions.length === 0) {
            return ["no functions found in the file"];
        }

        return functions.map(func => 
            `Function Name: ${func.name}, Parameters: [${func.parameters.join(', ')}], Body: ${func.body}`
        );
    }

    private checkFixedValues(code: string): CodeIssue[] {
        const results: CodeIssue[] = [];
        const ifFixedValueRegex = /if\s*\(\s*([a-zA-Z_][\w]*)\s*([=!]=+)\s*(\d+|'.*?'|".*?")\s*\)/gi;
        
        const lines = this.getCodeLines(code);
        lines.forEach((line, index) => {
            let match;
            while ((match = ifFixedValueRegex.exec(line)) !== null) {
                results.push({
                    line: index + 1,
                    level: this.SEVERITY.CRITICAL,
                    message: `Fixed value in if-statement: if(${match[1]} ${match[2]} ${match[3]})`,
                    rule: this.RULES.NO_FIXED_VALUES
                });
            }
        });

        return results;
    }

    private checkCurlyBraces(code: string): CodeIssue[] {
        const results: CodeIssue[] = [];
        const ifNoCurlyRegex = /^\s*if\s*\(.*\)\s*(?!\{)/;
        
        const lines = this.getCodeLines(code);
        lines.forEach((line, index) => {
            const match = line.match(/^\s*if\s*\(.*\)\s*({)?/);
            if (match && !match[1]) {
                results.push({
                    line: index + 1,
                    level: this.SEVERITY.CRITICAL,
                    message: `Missing curly braces: ${line.trim()}`,
                    rule: this.RULES.CURLY_BRACES
                });
            }
        });

        return results;
    }


    
    private checkEvalUsage(code: string): CodeIssue[] {
        const results: CodeIssue[] = [];
        const evalRegex = /\beval\s*\(/g;
        
        const lines = this.getCodeLines(code);
        lines.forEach((line, index) => {
            if (evalRegex.test(line)) {
                results.push({
                    line: index + 1,
                    level: this.SEVERITY.CRITICAL,
                    message: `Eval usage detected: ${line.trim()}`,
                    rule: this.RULES.NO_EVAL
                });
            }
        });

        return results;
    }

    
    private getCodeLines(code: string): string[] {
        return code.split('\n').map(line => line.trim());
    }

    
    public async analyze(): Promise<CodeAnalyzerResult> {
        try {
            const code = await fileHandler.getFileContext();
            
            const result: CodeAnalyzerResult = {
                functions: this.extractFunctions(code),
                ifWithFixedValue: this.checkFixedValues(code),
                ifWithoutCurlyBraces: this.checkCurlyBraces(code),
                evalUsage: this.checkEvalUsage(code),
                variableDeclaredButNotUsed: [] // TODO: Implement this check
            };

            await fileHandler.createLogFile("log.json", result);
            log("Code analysis completed successfully.");
            
            return result;
        } catch (error) {
            log("Error during code analysis:", error);
            throw error;
        }
    }
}

export const functionHandler = new FunctionHandler();

if (require.main === module) {
    (async () => {
        try {
            await functionHandler.analyze();
        } catch (error) {
            log("Error running analysis:", error);
            process.exit(1);
        }
    })();
}
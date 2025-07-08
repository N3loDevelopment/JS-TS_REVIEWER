import {
    log
} from "console";
import {
    fileHandler
} from "./FileHandler";
import * as fs from "fs";

export class FunctionHandler {
    constructor() {}

    extractFunctionsFromContext(context: string): string {
        const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)\s*{([\s\S]*?)}/g;
        const functions = [];
        let match;
        while ((match = functionRegex.exec(context)) !== null) {
            const functionName = match[1];
            const params = match[2].split(',').map(param => param.trim());
            const body = match[3].trim();
            functions.push({
                name: functionName,
                parameters: params,
                body: body
            });
        }
        if (functions.length === 0) {
            return "no functions found in the file";
        }
        return functions.map(func => {
            return `Function Name: ${func.name}, Parameters: [${func.parameters.join(', ')}], Body: ${func.body}`;
        }).join('\n');
    }

    checkIfWithFixedValue(code: string): {
        line: number,
        level: string,
        message: string
    } [] {
        const results: {
            line: number,
            level: string,
            message: string
        } [] = [];
        const ifFixedValueRegex = /if\s*\(\s*([a-zA-Z_][\w]*)\s*([=!]=+)\s*(\d+|'.*?'|".*?")\s*\)/gi;
        const lines = code.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let match;
            while ((match = ifFixedValueRegex.exec(lines[i])) !== null) {
                const variable = match[1];
                const operator = match[2];
                const value = match[3];
                results.push({
                    line: i + 1,
                    level: "critical",
                    message: `find if statement with fixed value: if(${variable} ${operator} ${value})`
                });
            }
        }
        return results;
    }

    checkIfWithoutCurlyBraces(code: string): {
        line: number,
        level: string,
        message: string
    } [] {
        const results: {
            line: number,
            level: string,
            message: string
        } [] = [];
        const lines = code.split('\n');
        const ifNoCurlyRegex = /^\s*if\s*\(.*\)\s*(?!\{)/;
        for (let i = 0; i < lines.length; i++) {
            const match = lines[i].match(/^\s*if\s*\(.*\)\s*({)?/);
            if (match && !match[1]) {
                results.push({
                    line: i + 1,
                    level: "critical",
                    message: `if statement without curly braces: ${lines[i].trim()}`
                });
            }
        }
        return results;
    }

    checkIfEvalUsage(code: string): {
        line: number,
        level: string,
        message: string
    } [] {
        const results: {
            line: number,
            level: string,
            message: string
        } [] = [];
        const evalRegex = /\beval\s*\(/g;
        const lines = code.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            if (evalRegex.test(line)) {
                results.push({
                    line: i + 1,
                    level: "critical",
                    message: `eval usage found: ${line}`
                });
            }
        }
        return results;
    }

    checkIfVariableDeclaredButNotUsed(code: string): {
        line: number,
        level: string,
        message: string
    } [] {
        const results: {
            line: number,
            level: string,
            message: string
        } [] = [];
        if (!code || typeof code !== 'string') return results;

        const lines = code.split('\n');
        const declaredVariables = new Map < string,
            {
                line: number,
                declaration: string
            } > ();

        const declarationRegex = /(?:let|const|var)\s+(\w+)(?:\s*=\s*([^;]+))?/g;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            let match;
            while ((match = declarationRegex.exec(line)) !== null) {
                const varName = match[1];
                if (!varName.startsWith('_')) {
                    declaredVariables.set(varName, {
                        line: i + 1,
                        declaration: line
                    });
                }
            }
        }

        const usedVariables = new Set < string > ();

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            if (line.match(/^\s*(let|const|var)\s+\w+/)) continue;

            for (const [varName] of declaredVariables) {
                const simpleUsageRegex = new RegExp(`\\b${varName}\\b`, 'g');
                if (simpleUsageRegex.test(line)) {
                    usedVariables.add(varName);
                }
            }
        }

        for (const [varName, info] of declaredVariables) {
            if (!usedVariables.has(varName)) {
                results.push({
                    line: info.line,
                    level: "warning",
                    message: `Variable "${varName}" wurde deklariert aber nie verwendet: ${info.declaration}`
                });
            }
        }

        return results;
    }



    async checkAll() {
        const code = await fileHandler.getFileContext();
        const logData: any = {};

        const functionsResult = this.extractFunctionsFromContext(code);
        logData.functions = functionsResult;

        logData.ifWithFixedValue = this.checkIfWithFixedValue(code);

        logData.ifWithoutCurlyBraces = this.checkIfWithoutCurlyBraces(code);

        logData.variableDeclaredButNotUsed = this.checkIfVariableDeclaredButNotUsed(code);

        logData.evalUsage = this.checkIfEvalUsage(code);

        fileHandler.createLogFile("log.json", logData);
    }
}


(async () => {
    const functionHandler = new FunctionHandler();
    try {
        await functionHandler.checkAll();
        log("Code analysis completed successfully.");
    } catch (error) {
        log("Error during code analysis:", error);
    }
})();

export const functionHandler = new FunctionHandler();
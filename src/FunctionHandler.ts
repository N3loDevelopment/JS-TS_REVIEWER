import { log } from "console";
import { fileHandler } from "./FileHandler";
import * as fs from "fs";

class FunctionHandler {
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

    checkIfWithFixedValue(code: string): {line: number, level: string, message: string}[] {
        const results: {line: number, level: string, message: string}[] = [];
        const ifFixedValueRegex = /if\s*\(\s*([a-zA-Z_][\w]*)\s*([=!]=+)\s*(\d+|'.*?'|".*?")\s*\)/g;
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

    checkIfWithoutCurlyBraces(code: string): {line: number, level: string, message: string}[] {
        const results: {line: number, level: string, message: string}[] = [];
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

    async checkAll() {
        const code = await fileHandler.getFileContext();
        const logData: any = {};

        const functionsResult = this.extractFunctionsFromContext(code);
        logData.functions = functionsResult;

        logData.ifWithFixedValue = this.checkIfWithFixedValue(code);

        logData.ifWithoutCurlyBraces = this.checkIfWithoutCurlyBraces(code);

        fileHandler.createLogFile("log.json", logData);
    }
}

(async () => {
   const handler = new FunctionHandler();
   await handler.checkAll();
   log("All checks completed.");
})();
import { IFunctionAnalyzer } from '../interfaces/IAnalyzer';

export class FunctionAnalyzer implements IFunctionAnalyzer {
    getType(): 'functions' {
        return 'functions';
    }

    analyze(code: string): string[] {
        const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)\s*{([\s\S]*?)}/g;
        const functions: Array<{name: string, parameters: string[], body: string}> = [];
        
        let match;
        while ((match = functionRegex.exec(code)) !== null) {
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
}
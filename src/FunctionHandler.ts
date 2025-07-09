import { log } from "console";
import { fileHandler } from "./services/FileHandler";
import { CodeAnalyzerResult, CodeIssue } from "./types/CodeReview";
import { EvalAnalyzer } from "./analyzers/EvalAnalyzer";
import { FixedValueAnalyzer } from "./analyzers/FixedValueAnalyzer";
import { CurlyBracesAnalyzer } from "./analyzers/CurlyBracesAnalyzer";
import { FunctionAnalyzer } from "./analyzers/FunctionAnalyzer";
import { IFunctionAnalyzer, ICodeAnalyzer } from './interfaces/IAnalyzer';

export class FunctionHandler {
    private functionAnalyzer: IFunctionAnalyzer;
    private codeAnalyzers: ICodeAnalyzer[];

    constructor() {
        this.functionAnalyzer = new FunctionAnalyzer();
        this.codeAnalyzers = [
            new FixedValueAnalyzer(),
            new CurlyBracesAnalyzer(),
            new EvalAnalyzer()
        ];
    }

    public async analyze(): Promise<CodeAnalyzerResult> {
        try {
            const code = await fileHandler.getFileContext();
            
            const result: CodeAnalyzerResult = {
                functions: this.functionAnalyzer.analyze(code),
                ifWithFixedValue: this.codeAnalyzers[0].analyze(code),
                ifWithoutCurlyBraces: this.codeAnalyzers[1].analyze(code),
                evalUsage: this.codeAnalyzers[2].analyze(code),
                variableDeclaredButNotUsed: []
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
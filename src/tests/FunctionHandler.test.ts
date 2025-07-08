import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { FunctionHandler } from "../FunctionHandler";
import { fileHandler } from "../FileHandler";

jest.mock("../FileHandler", () => ({
    fileHandler: {
        getFileContext: jest.fn(),
        createLogFile: jest.fn(),
    },
}));

describe("FunctionHandler", () => {
    let handler: FunctionHandler;

    beforeEach(() => {
        handler = new FunctionHandler();
    });

    describe("extractFunctionsFromContext", () => {
        it("should extract function details from code", () => {
            const code = `function foo(a, b) { return a + b; }`;
            const result = handler.extractFunctionsFromContext(code);
            console.log(result);
            expect(result).toContain("Function Name: foo");
        });

        it("should return message if no functions found", () => {
            const code = `const x = 5;`;
            const result = handler.extractFunctionsFromContext(code);
            expect(result).toBe("no functions found in the file");
        });
    });

    describe("checkIfWithFixedValue", () => {
        it("should detect if statements with fixed values", () => {
            const code = `if(x === 5) { doSomething(); } if(y == "test") { doSomethingElse(); } if(z !== 'abc') { anotherThing(); }`;
            const result = handler.checkIfWithFixedValue(code);
            expect(result.length).toBe(3);
            expect(result[0].message).toContain("if(x === 5)");
            expect(result[1].message).toContain('if(y == "test")');
            expect(result[2].message).toContain("if(z !== 'abc')");
        });

        it("should return empty array if no matches", () => {
            const code = `if (x > 0) {}`;
            const result = handler.checkIfWithFixedValue(code);
            expect(result).toEqual([]);
        });
    });

    describe("checkIfWithoutCurlyBraces", () => {
        it("should detect if statements without curly braces", () => {
            const code = `
                if (x === 5) doSomething();
                if (y) { doSomethingElse(); }
                if (z) anotherThing();
            `;
            const result = handler.checkIfWithoutCurlyBraces(code);
            expect(result.length).toBe(2);
            expect(result[0].message).toContain("if (x === 5) doSomething();");
            expect(result[1].message).toContain("if (z) anotherThing();");
        });

        it("should return empty array if all ifs have curly braces", () => {
            const code = `
                if (x) { foo(); }
                if (y) { bar(); }
            `;
            const result = handler.checkIfWithoutCurlyBraces(code);
            expect(result).toEqual([]);
        });
    });

    describe("checkAll", () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it("should call fileHandler methods and process code", async () => {
            const code = `
                function test(a) { return a; }
                if (x === 1) doSomething();
            `;
            (fileHandler.getFileContext as jest.MockedFunction<typeof fileHandler.getFileContext>).mockResolvedValue(code);

            await handler.checkAll();

            expect(fileHandler.getFileContext).toHaveBeenCalled();
            expect(fileHandler.createLogFile).toHaveBeenCalledWith(
                "log.json",
                expect.objectContaining({
                    functions: expect.stringContaining("Function Name: test"),
                    ifWithFixedValue: expect.any(Array),
                    ifWithoutCurlyBraces: expect.any(Array),
                })
            );
        });
    });
});
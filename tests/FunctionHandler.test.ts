import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { FunctionHandler } from "../compiled/FunctionHandler";
import { fileHandler } from "../compiled/FileHandler";

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
        jest.clearAllMocks();
    });

    describe("extractFunctionsFromContext", () => {
        it("extrahiert Funktionsdetails aus Code", () => {
            const code = `function foo(a, b) { return a + b; }`;
            const result = handler.extractFunctionsFromContext(code);
            expect(result).toContain("Function Name: foo");
            expect(result).toContain("Parameters: [a, b]");
        });

        it("gibt Hinweis zurück, wenn keine Funktion gefunden wird", () => {
            const code = `const x = 5;`;
            const result = handler.extractFunctionsFromContext(code);
            expect(result).toBe("no functions found in the file");
        });
    });

    describe("checkIfWithFixedValue", () => {
        it("findet if-Abfragen mit fixem Wert", () => {
            const code = `if(x == 5){}`;
            const result = handler.checkIfWithFixedValue(code);
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].message).toContain("if(x == 5)");
        });

        it("gibt leeres Array zurück, wenn keine passenden ifs", () => {
            const code = `if (x > 0) {}`;
            const result = handler.checkIfWithFixedValue(code);
            expect(result).toEqual([]);
        });
    });

    //dont work rn - the entire
    describe("checkIfWithoutCurlyBraces", () => {
        it("findet if-Abfragen ohne geschweifte Klammern", () => {
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

        it("gibt leeres Array zurück, wenn alle ifs Klammern haben", () => {
            const code = `
                if (x) { foo(); }
                if (y) { bar(); }
            `;
            const result = handler.checkIfWithoutCurlyBraces(code);
            expect(result).toEqual([]);
        });
    });

    describe("checkAll", () => {
        it("ruft fileHandler-Methoden auf und verarbeitet Code", async () => {
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
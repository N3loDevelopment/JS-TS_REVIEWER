import { fileHandler } from '../compiled/FileHandler';
import * as fs from 'fs';
import * as readline from 'readline';

jest.mock('fs');
jest.mock('readline');

describe('FileHandler', () => {
    let mockRl: any;

    beforeEach(() => {
        mockRl = {
            question: jest.fn(),
            close: jest.fn()
        };
        (readline.createInterface as jest.Mock).mockReturnValue(mockRl);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('checkFilePathExists', () => {
        it('should resolve with path if file exists', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);

            const path = 'test.txt';
            mockRl.question.mockImplementation((prompt: string, cb: (answer: string) => void) => {
                cb(path);
            });

            await expect(fileHandler.checkFilePathExists()).resolves.toBe(path);
            expect(mockRl.close).toHaveBeenCalled();
        });

        it('should reject if file does not exist', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            const path = 'notfound.txt';
            mockRl.question.mockImplementation((prompt: string, cb: (answer: string) => void) => {
                cb(path);
            });

            await expect(fileHandler.checkFilePathExists()).rejects.toThrow('Path not found');
            expect(mockRl.close).toHaveBeenCalled();
        });
    });

    describe('getFileContext', () => {
        it('should resolve with file content if file exists and is readable', async () => {
            const path = 'file.txt';
            const content = 'Hello, world!';
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(content);

            mockRl.question.mockImplementation((prompt: string, cb: (answer: string) => void) => {
                cb(path);
            });

            await expect(fileHandler.getFileContext()).resolves.toBe(content);
        });

        it('should reject if file is empty', async () => {
            const path = 'empty.txt';
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue('');

            mockRl.question.mockImplementation((prompt: string, cb: (answer: string) => void) => {
                cb(path);
            });

            await expect(fileHandler.getFileContext()).rejects.toThrow('File is empty or could not be read');
        });
    });

    describe('createLogFile', () => {
        it('should write data to file and log success', () => {
            const logSpy = jest.spyOn(console, 'log').mockImplementation();
            (fs.writeFile as unknown as jest.Mock).mockImplementation((file, data, cb) => cb(null));

            fileHandler.createLogFile('log.json', { a: 1 });

            expect(fs.writeFile).toHaveBeenCalledWith(
                'log.json',
                JSON.stringify({ a: 1 }, null, 2),
                expect.any(Function)
            );
            logSpy.mockRestore();
        });

        it('should log error if writing fails', () => {
            const logSpy = jest.spyOn(console, 'log').mockImplementation();
            const error = new Error('fail');
            (fs.writeFile as unknown as jest.Mock).mockImplementation((file, data, cb) => cb(null));

            fileHandler.createLogFile('log.json', { a: 1 });

            expect(fs.writeFile).toHaveBeenCalled();
            logSpy.mockRestore();
        });
    });
});
import { log } from "console";
import * as fs from "fs";
import * as readline from 'readline';
import { IFileHandler } from '../interfaces/IFileHandler';

class FileHandler implements IFileHandler {
    private readonly rl: readline.Interface;

    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    checkFilePathExists(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.rl.question('Enter the Filepath: ', (path) => {
                if (fs.existsSync(path)) {
                    resolve(path);
                } else {
                    reject(new Error("Path not found"));
                }
                this.rl.close();
            });
        });
    }

    async getFileContext(): Promise<string> {
        const validPath = await this.checkFilePathExists();
        const fileContext = fs.readFileSync(validPath, {
            encoding: 'utf8',
            flag: 'r'
        });
        
        if (!fileContext) {
            throw new Error("File is empty or could not be read");
        }
        
        return fileContext;
    }

    createLogFile(fileName: string, data: unknown): void {
        fs.writeFile(fileName, JSON.stringify(data, null, 2), (err) => {
            if (err) {
                log("Error writing to file:", err);
            } else {
                log(`Log file ${fileName} created successfully.`);
            }
        });
    }
}

export const fileHandler = new FileHandler();
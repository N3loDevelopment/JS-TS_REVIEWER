import {log} from "console";
import * as fs from "fs";
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


class FileHandler {
    constructor() {}

    private Path = "";

    checkFilePathExists(): Promise < string > {
        return new Promise((resolve, reject) => {

                rl.question('Enter the Filepath: ', (path) => {
                    if (fs.existsSync(path)) {
                        resolve(path);
                    } else {
                        reject(new Error("Path not found"));
                    }
                    rl.close();
                });
        });
    }

    async getFileContext(): Promise<string> {
        try {
            const validPath = await this.checkFilePathExists();
            const fileContext = fs.readFileSync(validPath, {
                encoding: 'utf8',
                flag: 'r'
            });
            log("File content: " + fileContext);
            return fileContext;
        } catch (err) {
            log("Failed to get file content: " + err);
            return "";
        }
    }
}

export const fileHandler = new FileHandler();
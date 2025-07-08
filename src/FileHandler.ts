import {
    log
} from "console";
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

    async getFileContext(): Promise < string > {
        return new Promise(async (resolve, reject) => {
            const validPath = await this.checkFilePathExists();
            const fileContext = fs.readFileSync(validPath, {
                encoding: 'utf8',
                flag: 'r'
            });
            if (fileContext) {
                resolve(fileContext);
            } else {
                reject(new Error("File is empty or could not be read"));
            }
        });
    }

    createLogFile(fileName: string, data: any): void {
        fs.writeFile(fileName, JSON.stringify(data, null, 2), (err) => {
            if (err) {
                log("Error writing to file:", err);
            } else {
                log(`Log file ${fileName} created successfully.`);
            }
        });
    }
}


function test() {
    let old = 0;
    let lol = true
    let dfhbgdushg = 0;
    if (lol)
        log(eval("2+2"));
    if (old == 7) {
        log("test2");
    }
}

export const fileHandler = new FileHandler();
export interface IFileHandler {
    checkFilePathExists(): Promise<string>;
    getFileContext(): Promise<string>;
    createLogFile(fileName: string, data: unknown): void;
}
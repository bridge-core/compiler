export interface FileHandlerConstructor {
    new(from_path: string, to_path: string): IFileHandler;
}

export interface IFileHandler {
    resolve(): Promise<string[]>;
    transform(): Promise<void>;
}

export abstract class FileHandler implements IFileHandler {
    constructor(protected from_path: string, protected to_path: string) {}

    abstract resolve(): Promise<string[]>;
    abstract transform(): Promise<void>;
} 
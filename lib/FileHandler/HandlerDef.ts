import { Dependency } from "../DependencyGraph/Dependency";

export interface FileHandlerConstructor {
    new(from_path: string, to_path: string): IFileHandler;
}

export interface IFileHandler {
    register(): Promise<void>;
    resolve(): Promise<void>;
    declare(): Promise<void>;
    file_path: string;
}

export abstract class FileHandler implements IFileHandler {
    constructor(protected from_path: string, protected to_path: string) {}

    get file_path() {
        return this.from_path;
    }

    abstract register(): Promise<void>;
    abstract resolve(): Promise<void>;
    abstract declare(): Promise<void>;
} 
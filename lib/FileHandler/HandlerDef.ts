import { Dependency } from "../DependencyGraph/Dependency";

export interface FileHandlerConstructor {
    new(from_path: string, to_path: string): IFileHandler;
}

export interface IFileHandler {
    resolve(dependency_map: Map<string, Dependency>): Promise<string[]>;
    transform(): Promise<void>;
    file_path: string;
}

export abstract class FileHandler implements IFileHandler {
    constructor(protected from_path: string, protected to_path: string) {}

    get file_path() {
        return this.from_path;
    }

    abstract resolve(dependency_map: Map<string, Dependency>): Promise<string[]>;
    abstract transform(): Promise<void>;
} 
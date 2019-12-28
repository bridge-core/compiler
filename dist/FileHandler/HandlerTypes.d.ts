export interface FileHandlerConstructor {
    new (from_path: string, to_path: string): IFileHandler;
}
export interface IFileHandler {
    resolve(): Promise<string[]>;
    transform(): Promise<void>;
}
export declare abstract class FileHandler implements IFileHandler {
    protected from_path: string;
    protected to_path: string;
    constructor(from_path: string, to_path: string);
    abstract resolve(): Promise<string[]>;
    abstract transform(): Promise<void>;
}

export declare let fs: IFS;
interface IDirent {
    isFile: () => boolean;
    name: string;
}
export interface IFS {
    readdir: ((path: string, config: {
        withFileTypes?: false;
    }) => Promise<string[]>) & ((path: string, config: {
        withFileTypes: true;
    }) => Promise<IDirent[]>);
    rmdir: (path: string, config?: {
        recursive?: boolean;
    }) => Promise<void>;
    mkdir: (path: string, config?: {
        recursive?: boolean;
    }) => Promise<void>;
    copyFile: (from: string, dest: string) => Promise<void>;
    writeFile: (path: string, data: unknown) => Promise<void>;
    readFile: (path: string) => Promise<unknown>;
    join: (...args: string[]) => string;
    basename: (path: string, extname?: string) => string;
    dirname: (path: string) => string;
}
export declare function setFS(fsArg: IFS): void;
export {};

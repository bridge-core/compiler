export declare function iterateDir(absPath: string, relPath: string, callback: (absPath: string, relPath: string) => Promise<void> | void): Promise<[string, string][]>;

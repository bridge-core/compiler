export declare function iterateDir(absPath: string, relPath: string, callback: (absPath: string, relPath: string) => Promise<void>): Promise<[string, string][]>;

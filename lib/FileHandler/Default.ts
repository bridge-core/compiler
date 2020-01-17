import { IFileHandlerConfig, IFileHandler } from "./main"
import { promises as fs } from "fs";

export function createDefaultFileHandler({ filePath }: IFileHandlerConfig): IFileHandler {
    return {
        async onCachePass() { return this },
        async onDependencyPass() {},

        async compile() {
            await fs.writeFile(filePath, fileData)
        }
    }
}
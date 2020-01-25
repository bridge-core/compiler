import { IFileHandlerConfig, IFileHandler, TFileData } from "./main"
import { promises as fs } from "fs"

export function createDefaultFileHandler({ filePath, fileData }: IFileHandlerConfig): IFileHandler {
    return {
        fileData,
        async onCachePass() { return this },
        async onDependencyPass() {},

        async compile(dependencyData: TFileData[]): Promise<Buffer> {
            await fs.writeFile(filePath, this.fileData)
            return this.fileData
        }
    }
}
import { INode } from "../DependencyGraph/Node";

export interface IFileHandler {
    onCachePass: () => Promise<IFileHandler>
    onDependencyPass: () => Promise<void>
    compile: () => Promise<void>
}
export interface IFileHandlerConfig {
    basePath: string
    filePath: string
    fileData: Buffer
    cache: (cacheKey: string, ...data: string[]) => void
    dependencyMap: Map<string, INode>
}
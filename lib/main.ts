import { createFastAccessCache } from "./FastAccessCache/main"
import path from "path"
import { createDependencyMap } from "./DependencyGraph/Map"
import { createResolver } from "./DependencyGraph/Resolve"
import { createPackIterator } from "./PackIterator/main"
import { createFileManager } from "./FileHandler/Create"
import { createFileType } from "./FileType/main"
import { createDefaultFileHandler } from "./FileHandler/Default"
import { promises as fs } from "fs"
import { IFileHandler } from "./FileHandler/main"
import { createNode } from "./DependencyGraph/Node"


export async function createProject(fromPath: string, toPath: string) {
    let dependencyMap = createDependencyMap()
    let lightningCache = createFastAccessCache<string>()
    let resolver = createResolver(dependencyMap)
    let fileManager = createFileManager()
    let fileType = createFileType(fromPath)

    return {
        FileManager: {
            add: fileManager.add
        },

        async build() {
            let filePaths = await createPackIterator(fromPath).allFiles
            //Create fileHandlers & onCachePass
            let handlers = await Promise.all(
                filePaths.map(async ([absPath, relPath]) => {
                    let currFileType = fileType.get(absPath)
                    let createHandler = fileManager.get(currFileType, path.extname(absPath))
                    let config = {
                        dependencyMap,
                        filePath: absPath,
                        basePath: fromPath,
                        cache: lightningCache.add(currFileType, absPath),
                        fileData: await fs.readFile(absPath) 
                    }

                    let handler: IFileHandler
                    if(createHandler === undefined)
                        handler = await createDefaultFileHandler(config).onCachePass()
                    else
                        handler = await createHandler(config).onCachePass()

                    dependencyMap.set(absPath, createNode(handler))
                    return handler;
                })
            )

            await Promise.all(handlers.map(async handler => await handler.onDependencyPass()))
            let sortedNodes = Array.from(resolver.resolve())
            await Promise.all(
                sortedNodes.map(
                    async node => 
                        node.fileHandler.fileData = await node.fileHandler.compile(
                            Array.from(node.dependencies).map(dep => dep.fileHandler.fileData)
                        )
                )
            )
        },

        async buildSingle() {

        },
        async buildLightningCache() {

        }
    }
}
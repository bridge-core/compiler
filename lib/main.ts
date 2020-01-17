import { createFastAccessCache } from "./FastAccessCache/main"
import path from "path"
import { createDependencyMap } from "./DependencyGraph/Map"
import { createResolver } from "./DependencyGraph/Resolve"
import { createPackIterator } from "./PackIterator/main"
import { createFileManager } from "./FileHandler/Create"
import { createFileType } from "./FileType/main"
import { createDefaultFileHandler } from "./FileHandler/Default"
import { promises as fs } from "fs"


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
                    let handler = fileManager.get(currFileType, path.extname(absPath))
                    let config = {
                        dependencyMap,
                        filePath: absPath,
                        basePath: fromPath,
                        cache: lightningCache.add(currFileType, absPath),
                        fileData: await fs.readFile(absPath) 
                    }

                    if(handler === undefined)
                        return await createDefaultFileHandler(config).onCachePass()
                    else
                        return await handler(config).onCachePass()
                })
            )

            await Promise.all(handlers.map(async handler => await handler.onDependencyPass()))
            let updateOrder = resolver.resolve()
            await Promise.all(handlers.map(async handler => await handler.compile()))
        },

        async buildSingle() {

        },
        async buildLightningCache() {

        }
    }
}
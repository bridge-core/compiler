import { promises as fs } from "fs"
import path from "path"

async function findFiles(absPath: string, relPath: string) {
    let dirents = await fs.readdir(absPath, { withFileTypes: true })
    let filePaths: [string, string][] = []

    await Promise.all(
        dirents.map(async dirent => {
            if(dirent.isFile()) {
                filePaths.push([
                    path.join(absPath, dirent.name),
                    path.join(relPath, dirent.name)
                ])
            } else {
                filePaths.push(...(await findFiles(
                    path.join(absPath, dirent.name),
                    path.join(relPath, dirent.name))
                ))
            }   
        })
    )

    return filePaths;
}

export function createPackIterator(dirPath: string) {
    return {
        get allFiles() {
            return findFiles(dirPath, ".");
        }
    }
}
import JSON5 from "https://cdn.skypack.dev/json5"
import { join } from './util/path.ts'

export class FileSystem {
    async mkdir(path: string, options: Deno.MkdirOptions) {
        await Deno.mkdir(path, options)
        const arr = await this.readdir("test")
    }

    readdir(
		path: string,
		config: { withFileTypes: true }
	): Promise<Deno.DirEntry[]>
	readdir(path: string, config?: { withFileTypes?: false }): Promise<string[]>
    async readdir(path: string, { withFileTypes }: { withFileTypes?: boolean } = { withFileTypes: false }) {
        const files = []
        for await (const handle of Deno.readDir(path)) {
            if(handle.isFile && handle.name === '.DS_Store') continue

            if(withFileTypes) files.push(handle)
            else files.push(handle.name)
        }
        return files
    }

    async readFilesFromDir(
        path: string,
        dirHandle:
            | Deno.DirEntry[]
            | AsyncIterable<Deno.DirEntry> = Deno.readDir(path)
    ) {
        const files: { name: string; path: string; kind: string }[] = []

        for await (const handle of dirHandle) {
            if (handle.isFile && handle.name === '.DS_Store') continue

            if (handle.isFile) 
                files.push({
                    name: handle.name,
                    kind: 'file',
                    path: join(path, handle.name)
                })
            else if (handle.isDirectory)
                files.push(
                    ...(await this.readFilesFromDir(
                        join(path, handle.name),
                        Deno.readDir(path)
                    ))
                )
        }

        return files
    }

    /**
     * Note: returns an Uint8Array and not a File as in the Native FS API
     * @param path The path to the file
     * @returns The contents of the file (Uint8Array)
     */
    readFile(path: string) {
        return Deno.readFile(path)
    }

    async unlink(path: string) {
        if (path.length === 0) throw new Error(`Error: filePath is empty`)
        await Deno.remove(path)
    }

    writeFile(path: string, data: Uint8Array | string) {
        if(typeof data === 'string') data = new TextEncoder().encode(data)
        return Deno.writeFile(path, data)
    }

    write(fileHandle: Deno.Writer, data: Uint8Array) {
        return Deno.writeAll(fileHandle, data)
    }

    async readJSON(path: string) {
        const file = await this.readFile(path)
        try {
            return JSON5.parse(file.toString())
        } catch {
            throw new Error(`Invalid JSON: ${path}`)
        }
    }

    // deno-lint-ignore no-explicit-any
    writeJSON(path: string, data: any, beautify = false) {
        return this.writeFile(
            path,
            JSON.stringify(data, null, beautify ? '\t' : undefined)
        )
    }

    copyFile(originPath: string, destinationPath: string) {
        return Deno.copyFile(originPath, destinationPath)
    }

    async fileExists(path: string) {
        // https://stackoverflow.com/questions/56658114/how-can-one-check-if-a-file-or-directory-exists-using-deno
        try {
            await Deno.stat(path)
            return true
        } catch (error) {
            if (error instanceof Deno.errors.NotFound) {
              return false
            } else {
              throw error
            }
        }
    }
}
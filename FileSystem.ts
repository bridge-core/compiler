import JSON5 from "https://cdn.skypack.dev/json5"
import { join, relative } from './util/path.ts'

// FIXME: Inconsistent between DirectoryHandle and FileHandle: File constructor accepts the Deno.File while Directory constructor calls Deno.readDir itself
abstract class BaseFileSystemHandle {
    readonly kind: 'file' | 'directory'
    readonly name: string

    readonly path: string
    constructor(kind: 'file' | 'directory', name: string, path: string) {
        this.kind = kind
        this.name = name
        this.path = path
    }

    isSameEntry(other: BaseFileSystemHandle): Promise<boolean> | boolean {
        return this.path === other.path
    }
    // deno-lint-ignore no-explicit-any
    queryPermission(descriptor: any) {
        return "granted"
    }

    // deno-lint-ignore no-explicit-any
    requestPermission(descriptor: any) {
        return "granted"
    }
}

export class FileSystemWritableFileStream {
    protected file: File
    protected name: string
    
    constructor(file: File, name: string) {
        this.file = file
        this.name = name
    }
    async write(data: Uint8Array) { // FIXME: this needs to accept FileSystemWriteChunkType not Uint8Array
        // let internalData: ArrayBuffer
        // if((data as ArrayBufferView).buffer) internalData = (data as ArrayBufferView).buffer
        // else if (data instanceof Blob) internalData = await data.arrayBuffer()
        // else if(data instanceof ArrayBuffer) internalData = data
        // else if(typeof data === 'string') internalData = data.
        await Deno.write(this.file.file.rid, data)
    }
    async seek(position: number) {
        await Deno.seek(this.file.file.rid, position, Deno.SeekMode.Start)
    }
    async truncate(size: number) { // Deno doesn't seem to have a method for this
        this.file.file.close()
        await Deno.truncate(this.name, size)
        this.file.file = await Deno.open(this.name)
    }
    close() {
        this.file.file.close()
    }
}

export class File {

    name: string
    path: string
    file: Deno.File
    constructor(file: Deno.File, name: string, path: string) {
        this.name = name
        this.path = path
        this.file = file
    }
    async text() {
        const data = new Uint8Array()
        await this.file.read(data)
        return data.toString()
    }
}

// type WriteParams =
//     | { type: 'write'; position?: number; data: BufferSource | Blob | string }
//     | { type: 'seek'; position: number }
//     | { type: 'truncate'; size: number }

type FileSystemWriteChunkType = BufferSource | Blob | string// | WriteParams

export class FileSystemFileHandle extends BaseFileSystemHandle {
    readonly kind: 'file' = 'file'

    protected file: File
    constructor(name: string, path: string, file: Deno.File) {
        super('file', name, path)
        this.file = new File(file, name, path)
    }

    getFile(): Promise<File> | File {
        return this.file
    }

    createWritable(options?: { keepExistingData: boolean }): FileSystemWritableFileStream {
        return new FileSystemWritableFileStream(this.file, this.name)
    }
}
type FileSystemHandle = FileSystemFileHandle | FileSystemDirectoryHandle;
interface FileSystemRemoveOptions {
    recursive?: boolean
}
interface FileSystemGetFileOptions {
    create?: boolean;
}
interface FileSystemGetDirectoryOptions {
    create?: boolean;
}
export class FileSystemDirectoryHandle extends BaseFileSystemHandle {
    readonly kind: 'directory' = 'directory'
    children: AsyncIterable<Deno.DirEntry>

    constructor(name: string, path: string, create = false) {
        super('directory', name, path)
        if(create) 
        try {
            Deno.mkdir(path)
        } catch {/**/}
        this.children = Deno.readDir(path)
    }

    async getFileHandle(name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle> {
        return new FileSystemFileHandle(name, join(this.path, name), await Deno.open(join(this.path, name)))
    }
    getDirectoryHandle(name: string, options?: FileSystemGetDirectoryOptions): FileSystemDirectoryHandle {
        return new FileSystemDirectoryHandle(name, join(this.path, name), options?.create)
    }
    async removeEntry(name: string, options?: FileSystemRemoveOptions) {
        await Deno.remove(join(this.path, name), options)
    }
    resolve(possibleDescendant: FileSystemHandle): string[] | null {
        return relative(this.path, possibleDescendant.path).split('/')
    }

    // FIXME: My best attempt on the iterators here, I'm not sure if it works
    keys(): AsyncIterableIterator<string> {
        const thing = this.children[Symbol.asyncIterator]()
        const iterable: AsyncIterableIterator<string> =  {
            next: async () => {
                const next = await thing.next()
                if(next.done) return { done: true, value: null }
                const dirEntry = next.value
                const ret: IteratorYieldResult<string> = {
                    value: dirEntry.name,
                    done: false
                }
                return ret
            },
            [Symbol.asyncIterator]: () => {
                return iterable
            }
        }
        return iterable
    }
    values(): AsyncIterableIterator<FileSystemHandle> {
        const thing = this.children[Symbol.asyncIterator]()
        const iterable: AsyncIterableIterator<FileSystemHandle> =  {
            next: async () => {
                const next = await thing.next()
                if(next.done) return { done: true, value: null }
                const dirEntry = next.value
                const ret: IteratorYieldResult<FileSystemHandle> = {
                    value: new FileSystemFileHandle(dirEntry.name, join(this.path, dirEntry.name), await Deno.open(join(this.path, dirEntry.name))),
                    done: false
                }
                return ret
            },
            [Symbol.asyncIterator]: () => {
                return iterable
            }
        }
        return iterable
    }
    entries(): AsyncIterableIterator<[string, FileSystemHandle]> {
        const thing = this.children[Symbol.asyncIterator]()
        const iterable: AsyncIterableIterator<[string, FileSystemHandle]> =  {
            next: async () => {
                const next = await thing.next()
                if(next.done) return { done: true, value: null }
                const dirEntry = next.value
                const ret: IteratorYieldResult<[string, FileSystemHandle]> = {
                    value: [dirEntry.name, new FileSystemFileHandle(dirEntry.name, join(this.path, dirEntry.name), await Deno.open(join(this.path, dirEntry.name)))],
                    done: false
                }
                return ret
            },
            [Symbol.asyncIterator]: () => {
                return iterable
            }
        }
        return iterable
    }
    [Symbol.asyncIterator]: FileSystemDirectoryHandle['entries'];
}


export class FileSystem {
    baseDirectory: string
    
    constructor(baseDirectory: string) {
        this.baseDirectory = baseDirectory
    }
    
    async getFileHandle(path: string, create = false) {
        return new FileSystemFileHandle(path.split('/').pop()!, path, await Deno.open(path, { create, read: true, write: true }))
    }

    async getDirectoryHandle(path: string, { create, createOnce }: Partial<{ create: boolean; createOnce: boolean }> = {}) {
        // return new FileSystemDirectoryHandle(path.split('/').pop()!, path, await Deno.open(path, { create, read: true, write: true }))
    }

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
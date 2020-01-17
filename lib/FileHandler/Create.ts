import { IFileHandler, IFileHandlerConfig } from "./main"

export function createFileManager() {
    let fileHandlers = new Map<string, Map<string, (config: IFileHandlerConfig) => IFileHandler>>()
    
    return {
        add(type: string, extension: string, fileHandler: (config: IFileHandlerConfig) => IFileHandler) {
            let extMap = fileHandlers.get(type)
            if(extMap === undefined) {
                extMap = new Map<string, (config: IFileHandlerConfig) => IFileHandler>()
                fileHandlers.set(type, extMap)
            }
                
            extMap.set(extension, fileHandler)
        },

        get(type: string, extension: string) {
            return fileHandlers.get(type)?.get(extension)
        }
    }
}
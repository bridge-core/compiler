export type TFileType = string
export type TFilePath = string
export type TCacheKey = string

export interface IFastAccessCache<T> {
    add: (fileType: TFileType, filePath: TFilePath) => (cacheKey: TCacheKey, ...data: T[]) => void
    get: (fileType: TFileType, filePath: TFilePath, cacheKey: TCacheKey) => T[] | undefined
}

export function createFastAccessCache<T>(): IFastAccessCache<T> {
    const CACHE = new Map<TFileType, Map<TFilePath, Map<TCacheKey, T[]>>>()

    return {
        add(fileType: TFileType, filePath: TFilePath) {
            return (cacheKey: TCacheKey, ...data: T[]) => {
                let typeCache = CACHE.get(fileType)
                if(typeCache === undefined) {
                    typeCache = new Map<TFilePath, Map<TCacheKey, T[]>>()
                    CACHE.set(fileType, typeCache)
                } 

                let fileCache = typeCache.get(filePath)
                if(fileCache === undefined) {
                    fileCache = new Map<TCacheKey, T[]>()
                    typeCache.set(filePath, fileCache)
                }

                let finalCache = fileCache.get(cacheKey)
                if(finalCache === undefined) {
                    fileCache.set(cacheKey, data)
                } else {
                    finalCache.push(...data)
                }
            }
        },

        get(fileType: TFileType, filePath: TFilePath, cacheKey: TCacheKey) {
            return CACHE.get(fileType)?.get(filePath)?.get(cacheKey)
        }
    }
}
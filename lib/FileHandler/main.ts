import { INode } from '../DependencyGraph/Node'

export type TFileData = Buffer

export interface IFileHandler {
	/**
	 * fileData of *this* file
	 */
	fileData: TFileData
	/**
	 * Parse important file data and save it inside of a fast access cache.
	 * dependencyMap may not be setup completely yet
	 */
	onCachePass: () => Promise<IFileHandler>
	/**
	 * Register file dependencies
	 */
	onDependencyPass: () => Promise<void>
	/**
	 * Resolve file dependencies to create a final file to save to destination location
	 * @param dependencyData fileData[] of registered dependencies
	 * @returns fileData of current file
	 */
	compile: (dependencyData: TFileData[]) => Promise<TFileData>
}
export interface IFileHandlerConfig {
	basePath: string
	filePath: string
	fileData: Buffer
	cache: (cacheKey: string, ...data: string[]) => void
	dependencyMap: Map<string, INode>
}

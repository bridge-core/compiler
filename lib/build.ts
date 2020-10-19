import { TCompilerOptions } from './main'
import { promises as fs } from 'fs'
import { iterateDir } from './iterateDir'
import { get } from './fileType'
import { dirname, join } from 'path'
import { createNode, INode } from './dependencies/node'
import { resolveDependencies } from './dependencies/resolve'

export interface FileTypeResolver {
	doNotTransfer?: boolean
	plugins?: (() => ICompilerPlugin)[]
}
export interface FileTypeResolverProcessed {
	doNotTransfer?: boolean
	plugins?: ICompilerPlugin[]
}

export interface ICompilerPlugin {
	afterRead: (node: INode) => Promise<unknown> | unknown
	resolveDependencies?: (
		node: INode,
		keyRegistry: Map<string, INode>
	) => Promise<void> | void
	transform?: (node: INode) => Promise<unknown> | unknown
	afterTransform?: (node: INode) => Promise<unknown> | unknown
}

function getPlugins(
	relPath: string,
	resolveConfig: Record<string, FileTypeResolverProcessed>,
	fromRp = false
) {
	return getCurrentResolver(relPath, resolveConfig, fromRp).plugins ?? []
}

function getCurrentResolver(
	relPath: string,
	resolveConfig: Record<string, FileTypeResolverProcessed>,
	fromRp = false
) {
	return resolveConfig[get(relPath, fromRp)] ?? {}
}

export async function resolvePack(
	absPath: string,
	relPath: string,
	dependencyMap: Map<string, INode>,
	keyRegistry: Map<string, INode>,
	resolveConfig: Record<string, FileTypeResolverProcessed>,
	fromRp = false
) {
	const resolvePlugins = getPlugins(relPath, resolveConfig as any, fromRp)

	const node = createNode(absPath, relPath, fromRp)
	node.fileContent = await fs.readFile(node.absPath)
	dependencyMap.set(absPath, node)

	await Promise.all(
		resolvePlugins.map(async (plugin) => {
			const transformedFile = await plugin.afterRead?.(node)
			if (transformedFile) node.fileContent = transformedFile
		})
	)

	await Promise.all(
		resolvePlugins.map((plugin) =>
			plugin.resolveDependencies?.(node, keyRegistry)
		)
	)
}

export async function buildAddOn({
	bp,
	obp,
	rp,
	orp,
	resolve: resolveConfig,
}: TCompilerOptions) {
	// Create output directories
	await Promise.all([
		fs.mkdir(obp, { recursive: true }),
		fs.mkdir(orp, { recursive: true }),
	]).catch(() => {})

	const dependencyMap = new Map<string, INode>()
	const keyRegistry = new Map<string, INode>()

	// First pass: Generate dependency map
	await iterateDir(bp, '.', (absPath, relPath) =>
		resolvePack(
			absPath,
			relPath,
			dependencyMap,
			keyRegistry,
			resolveConfig as any
		)
	)
	await iterateDir(rp, '.', (absPath, relPath) =>
		resolvePack(
			absPath,
			relPath,
			dependencyMap,
			keyRegistry,
			resolveConfig as any,
			true
		)
	)

	// console.log(dependencyMap, keyRegistry)
	const nodes = [...resolveDependencies(dependencyMap, keyRegistry)]
	console.log(nodes.map((node) => node.relPath))
	// Second pass: Transform and move files
	for (const node of nodes) {
		const resolver = getCurrentResolver(
			node.relPath,
			resolveConfig as any,
			node.isRpFile
		)
		const resolvePlugins = resolver.plugins ?? []

		// We don't have any special parsing to do, just copy the file over
		if (resolvePlugins.length === 0 && !resolver.doNotTransfer) {
			const savePath = join(node.isRpFile ? orp : obp, node.relPath)
			try {
				await fs.mkdir(dirname(savePath), { recursive: true })
			} catch {}

			await fs.copyFile(node.absPath, savePath)

			continue
		}

		// "transform" pass
		for (const plugin of resolvePlugins) {
			const transformedFile = await plugin.transform?.(node)
			if (transformedFile) node.fileContent = transformedFile
		}
		// "afterTransform" pass
		for (const plugin of resolvePlugins) {
			const transformedFile = await plugin.afterTransform?.(node)
			if (transformedFile) node.fileContent = transformedFile
		}

		// Write file to destination
		if (!resolver.doNotTransfer) {
			const savePath = join(node.isRpFile ? orp : obp, node.relPath)
			try {
				await fs.mkdir(dirname(savePath), { recursive: true })
			} catch {}

			await fs.writeFile(savePath, node.fileContent)
		}
	}
}

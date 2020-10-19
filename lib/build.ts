import { TCompilerOptions } from './main'
import { promises as fs } from 'fs'
import { iterateDir } from './iterateDir'
import { dirname, join } from 'path'
import { createNode, INode } from './dependencies/node'
import { resolveDependencies } from './dependencies/resolve'

export interface FileTypeResolver {
	match?: string | ((node: INode) => boolean)
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

function getPlugins(node: INode, resolveConfig: FileTypeResolver[]) {
	return getCurrentResolver(node, resolveConfig).plugins ?? []
}

function isCorrectResolver(
	match: string | ((node: INode) => boolean),
	node: INode
) {
	if (typeof match === 'string') {
		if (match.startsWith('RP/') || match.startsWith('BP/'))
			return node.matchPath.startsWith(match)
		return node.relPath.startsWith(match)
	}
	return match(node)
}

function getCurrentResolver(node: INode, resolveConfig: FileTypeResolver[]) {
	return (
		resolveConfig.find(
			(resolver) =>
				!resolver.match || isCorrectResolver(resolver.match, node)
		) ?? {}
	)
}

export async function resolvePack(
	absPath: string,
	relPath: string,
	dependencyMap: Map<string, INode>,
	keyRegistry: Map<string, INode>,
	resolveConfig: FileTypeResolver[],
	fromRp = false,
	obp: string,
	orp: string
) {
	// Create base node
	const node = createNode(absPath, relPath, fromRp)
	node.fileContent = await fs.readFile(node.absPath)
	node.savePath = join(node.isRpFile ? orp : obp, node.relPath)
	dependencyMap.set(absPath, node)

	// Plugins
	const resolvePlugins = getPlugins(node, resolveConfig)

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
			resolveConfig as any,
			false,
			obp,
			orp
		)
	)
	await iterateDir(rp, '.', (absPath, relPath) =>
		resolvePack(
			absPath,
			relPath,
			dependencyMap,
			keyRegistry,
			resolveConfig as any,
			true,
			obp,
			orp
		)
	)

	// console.log(dependencyMap, keyRegistry)
	const nodes = [...resolveDependencies(dependencyMap, keyRegistry)]
	// Second pass: Transform and move files
	for (const node of nodes) {
		const resolver = getCurrentResolver(node, resolveConfig as any)
		const resolvePlugins = resolver.plugins ?? []

		// We don't have any special parsing to do, just copy the file over
		if (resolvePlugins.length === 0 && !resolver.doNotTransfer) {
			try {
				await fs.mkdir(dirname(node.savePath), { recursive: true })
			} catch {}

			await fs.copyFile(node.absPath, node.savePath)

			continue
		}

		// "transform" pass
		for (const plugin of resolvePlugins) {
			const transformedFile = await plugin.transform?.(node)
			if (transformedFile) node.fileContent = transformedFile
		}
		// "afterTransform" pass
		for (const plugin of resolvePlugins.reverse()) {
			const transformedFile = await plugin.afterTransform?.(node)
			if (transformedFile) node.fileContent = transformedFile
		}

		// Write file to destination
		if (!resolver.doNotTransfer) {
			try {
				await fs.mkdir(dirname(node.savePath), { recursive: true })
			} catch {}

			await fs.writeFile(node.savePath, node.fileContent)
		}
	}
}

import { TCompilerOptions } from './main'
import { promises as fs } from 'fs'
import { iterateDir } from './iterateDir'
import { get } from './fileType'
import { join } from 'path'
import { createNode, INode } from './dependencies/node'
import { resolveDependencies } from './dependencies/resolve'

export interface FileTypeResolver {
	plugins?: (() => ICompilerPlugin)[]
}

export interface ICompilerPlugin {
	resolveDependencies: (
		node: INode,
		keyRegistry: Map<string, INode>
	) => Promise<void> | void
	transform: (node: INode) => Promise<unknown> | unknown
}

export async function buildAddOn({
	bp,
	obp,
	rp,
	orp,
	resolve,
}: TCompilerOptions) {
	// Create output directories
	await Promise.all([
		fs.mkdir(obp, { recursive: true }),
		fs.mkdir(orp, { recursive: true }),
	])

	// Create all plugins
	resolve = resolve ?? {}
	for (const fileType in resolve as Record<string, FileTypeResolver>) {
		;(resolve as any)[fileType].plugins =
			(resolve as Record<string, FileTypeResolver>)[
				fileType
			].plugins?.map((plugin) => plugin()) ?? []
	}

	const dependencyMap = new Map<string, INode>()
	const keyRegistry = new Map<string, INode>()

	// First pass: Generate dependency map
	await iterateDir(bp, '.', async (absPath, relPath) => {
		const node = createNode(absPath, relPath, false)
		dependencyMap.set(absPath, node)
		const fileType = get(relPath)
		const resolver = (resolve as any)[fileType]
		const resolvePlugins = resolver.plugins ?? []

		await Promise.all(
			(resolvePlugins as ICompilerPlugin[]).map((plugin) =>
				plugin.resolveDependencies(node, keyRegistry)
			)
		)
	})
	await iterateDir(rp, '.', async (absPath, relPath) => {
		const node = createNode(absPath, relPath, true)
		dependencyMap.set(absPath, node)
		const fileType = get(relPath)
		const resolver = (resolve as any)[fileType]
		const resolvePlugins = resolver.plugins ?? []

		await Promise.all(
			(resolvePlugins as ICompilerPlugin[]).map((plugin) =>
				plugin.resolveDependencies(node, keyRegistry)
			)
		)
	})

	const nodes = [...resolveDependencies(dependencyMap, keyRegistry)]

	// Second pass: Transform and move files
	await Promise.all(
		nodes.map(async (node) => {
			const fileType = get(node.relPath)
			const resolver = (resolve as any)[fileType]
			const resolvePlugins = resolver.plugins ?? []

			// We don't have any special parsing to do, just copy the file over
			if (resolvePlugins.length > 0)
				return await fs.copyFile(
					node.absPath,
					join(node.isRpFile ? orp : obp, node.relPath)
				)

			node.fileContent = await fs.readFile(node.absPath)
			await Promise.all(
				(resolvePlugins as ICompilerPlugin[]).map((plugin) =>
					plugin.transform(node)
				)
			)
			await fs.writeFile(
				join(node.isRpFile ? orp : obp, node.relPath),
				node.fileContent
			)
		})
	)
}

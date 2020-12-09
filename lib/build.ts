import { ICompilerOptions, IPackTypes } from './main.ts'
import { iterateDir } from './iterateDir.ts'
import { createNode, INode } from './dependencies/node.ts'
import { resolveDependencies } from './dependencies/resolve.ts'
import { dirname, join } from 'https://deno.land/std@0.74.0/path/mod.ts'

export interface IFileTypeResolver {
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

export class AddOnBuilder {
	protected input: IPackTypes
	protected output: IPackTypes
	protected resolveConfig: IFileTypeResolver[]
	protected dependencyMap = new Map<string, INode>()
	protected keyRegistry = new Map<string, INode>()

	constructor({
		input: { behaviorPack, resourcePack } = {},
		output: {
			behaviorPack: oBehaviorPack,
			resourcePack: oResourcePack,
		} = {},
		resolve: resolveConfig,
	}: Partial<ICompilerOptions>) {
		if (!oBehaviorPack || !oResourcePack || !behaviorPack || !resourcePack)
			throw new Error(`Missing required config option!`)

		this.input = {
			behaviorPack,
			resourcePack,
		}
		this.output = {
			behaviorPack: oBehaviorPack,
			resourcePack: oResourcePack,
		}
		this.resolveConfig = resolveConfig ?? []
	}

	async build() {
		await this.initOutputDirs()

		// First pass: Generate dependency map
		await iterateDir(this.input.behaviorPack, '.', (absPath, relPath) =>
			this.resolvePack(absPath, relPath)
		)
		await iterateDir(this.input.resourcePack, '.', (absPath, relPath) =>
			this.resolvePack(absPath, relPath, true)
		)

		const nodes = [
			...resolveDependencies(this.dependencyMap, this.keyRegistry),
		]
		// Second pass: Transform and move files
		for (const node of nodes) {
			const resolver = this.getCurrentResolver(node, this.resolveConfig)
			const resolvePlugins = resolver.plugins ?? []

			// We don't have any special parsing to do, just copy the file over
			if (resolvePlugins.length === 0 && !resolver.doNotTransfer) {
				try {
					await Deno.mkdir(dirname(node.savePath), {
						recursive: true,
					})
				} catch {}

				await Deno.copyFile(node.absPath, node.savePath)

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
					await Deno.mkdir(dirname(node.savePath), {
						recursive: true,
					})
				} catch {}

				await Deno.writeFile(
					node.savePath,
					node.fileContent as Uint8Array
				)
			}
		}
	}

	async resolvePack(absPath: string, relPath: string, fromRp = false) {
		// Create base node
		const node = createNode(absPath, relPath, fromRp)
		node.fileContent = await Deno.readFile(node.absPath)
		node.savePath = join(
			node.isRpFile ? this.output.resourcePack : this.output.behaviorPack,
			node.relPath
		)
		this.dependencyMap.set(absPath, node)

		// Plugins
		const resolvePlugins = this.getPlugins(node, this.resolveConfig)

		await Promise.all(
			resolvePlugins.map(async (plugin) => {
				const transformedFile = await plugin.afterRead?.(node)
				if (transformedFile) node.fileContent = transformedFile
			})
		)

		await Promise.all(
			resolvePlugins.map((plugin) =>
				plugin.resolveDependencies?.(node, this.keyRegistry)
			)
		)
	}

	async initOutputDirs() {
		// Delete old output
		await Promise.all([
			Deno.remove(this.output.behaviorPack, { recursive: true }),
			Deno.remove(this.output.resourcePack, { recursive: true }),
		])
		// Create output directories
		await Promise.all([
			Deno.mkdir(this.output.behaviorPack, { recursive: true }),
			Deno.mkdir(this.output.resourcePack, { recursive: true }),
		]).catch(() => {})
	}

	getPlugins(node: INode, resolveConfig: IFileTypeResolver[]) {
		return this.getCurrentResolver(node, resolveConfig).plugins ?? []
	}

	isCorrectResolver(match: string | ((node: INode) => boolean), node: INode) {
		if (typeof match === 'string') {
			if (match.startsWith('RP/') || match.startsWith('BP/'))
				return node.matchPath.startsWith(match)
			return node.relPath.startsWith(match)
		}
		return match(node)
	}

	getCurrentResolver(node: INode, resolveConfig: IFileTypeResolver[]) {
		return (
			resolveConfig.find(
				(resolver) =>
					!resolver.match ||
					this.isCorrectResolver(resolver.match, node)
			) ?? {}
		)
	}
}

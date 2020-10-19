import { FileTypeResolverProcessed } from '../build'
import { get } from '../fileType'
import { createNode, INode } from './node'
import { promises as fs } from 'fs'

function resolveSingle(
	dep: INode,
	resolved: Set<INode>,
	unresolved: Set<INode>,
	keyRegistry: Map<string, INode>
) {
	unresolved.add(dep)

	for (let d of dep.dependencies) {
		if (typeof d === 'string') {
			const node = keyRegistry.get(d)
			if (!node)
				throw new Error(`Undefined lookup in key registry: "${d}"`)
			d = node
		}

		if (!resolved.has(d)) {
			if (unresolved.has(d))
				throw new Error('Circular dependency detected!')
			resolveSingle(d, resolved, unresolved, keyRegistry)
		}
	}

	resolved.add(dep)
	unresolved.delete(dep)
}

export function resolveDependencies(
	dependencyMap: Map<string, INode>,
	keyRegistry: Map<string, INode>
) {
	let resolved = new Set<INode>()

	dependencyMap.forEach((dep) => {
		if (!resolved.has(dep)) {
			resolveSingle(dep, resolved, new Set<INode>(), keyRegistry)
		}
	})

	return resolved
}

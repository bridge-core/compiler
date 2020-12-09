import { INode } from './node.ts'

function resolveSingle(
	dep: INode,
	resolved: Set<INode>,
	unresolved: Set<INode>,
	keyRegistry: Map<string, INode>
) {
	unresolved.add(dep)

	for (let d of dep.dependencies) {
		if (typeof d === 'string' || Array.isArray(d)) {
			const optionalDep = Array.isArray(d) ? d[1] : false
			d = d[0]
			const node = keyRegistry.get(d)
			if (!node && !optionalDep)
				throw new Error(`Undefined lookup in key registry: "${d}"`)
			else if (!node) continue

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

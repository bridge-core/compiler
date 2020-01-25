import { INode } from "./Node";

function resolveSingle(dep: INode, resolved: Set<INode>, unresolved: Set<INode>) {
    unresolved.add(dep);

    for(let d of dep.dependencies) {
        if(!resolved.has(d)) {
            if(unresolved.has(d))
                throw new Error("Circular dependency detected!");
            resolveSingle(d, resolved, unresolved);
        }
    }

    resolved.add(dep);
    unresolved.delete(dep);
}

export function createResolver(dependencyMap: Map<string, INode>) {
    return {
        resolve() {
            let resolved = new Set<INode>();

            dependencyMap.forEach(dep => {
                if(!resolved.has(dep)) {
                    resolveSingle(dep, resolved, new Set<INode>());
                }
            });

            return resolved;
        }
    }
}
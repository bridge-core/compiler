import { Dependency } from "./Dependency";

export function resolve(dependency_map: Map<string, Dependency>) {
    let resolved = new Set<Dependency>();

    dependency_map.forEach(dep => {
        if(!resolved.has(dep)) {
            resolveSingle(dep, resolved, new Set<Dependency>());
        }
    });

    return resolved;
}

function resolveSingle(dep: Dependency, resolved: Set<Dependency>, unresolved: Set<Dependency>) {
    unresolved.add(dep);

    for(let d of dep.getDependencies()) {
        if(!resolved.has(d)) {
            if(unresolved.has(d))
                throw new Error("Circular dependency detected!");
            resolveSingle(d, resolved, unresolved);
        }
    }

    resolved.add(dep);
    unresolved.delete(dep);
}
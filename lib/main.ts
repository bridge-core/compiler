import { promises as fs } from "fs";
import { join } from "path";
import BasePath from "./Env/BasePath";
import { get } from "./FileHandler/main";
import { IFileHandler } from "./FileHandler/HandlerDef";
import { DependencyMap } from "./DependencyGraph/Map";
import { Dependency } from "./DependencyGraph/Dependency";
import { resolve as resolveDependencies } from "./DependencyGraph/Resolve";

async function collectHandlers(from_path: string, to_path: string) {
    let content = await fs.readdir(from_path, { withFileTypes: true });
    let handlers: IFileHandler[] = [];

    await Promise.all(
        content.map(async dirent => {
            if(dirent.isDirectory())
                handlers.push(...(await collectHandlers(join(from_path, dirent.name), join(to_path, dirent.name))))
            else
                handlers.push(get(join(from_path, dirent.name), join(to_path, dirent.name)));
        })
    );
    return handlers;
}

export async function compile(from_path: string, to_path: string) {
    BasePath.set(from_path);
    const HANDLERS = await collectHandlers(from_path, to_path);
    HANDLERS.forEach(h => DependencyMap.set(h.file_path, new Dependency(h)));
    //Call the resolve method on all FileHandlers so they get the chance to register dependencies
    await Promise.all(
        HANDLERS.map(h => h.resolve(DependencyMap))
    );
    
    //Resolve dependencies in the correct order and call the transform method
    await Promise.all(
        Array.from(resolveDependencies(DependencyMap))
            .map(dep => dep.handler.transform())
    );
}
export { register } from "./FileHandler/main";
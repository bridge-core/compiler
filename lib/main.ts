import { promises as fs } from "fs";
import { join } from "path";
import BasePath from "./Env/BasePath";
import { get } from "./FileHandler/main";
import { IFileHandler } from "./FileHandler/HandlerDef";

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
    HANDLERS.forEach(h => h.resolve());
    HANDLERS.forEach(h => h.transform());
}
export { register } from "./FileHandler/main";
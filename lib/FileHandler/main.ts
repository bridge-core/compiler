import { get as getFileType } from "../FileType/main";
import { extname } from "path";
import { DefaultHandler } from "./DefaultHandler";
import { FileHandlerConstructor } from "./HandlerDef";


let STORE: { [file_type: string]: { [file_ext: string]: FileHandlerConstructor } } = {};

export function register(file_type: string, file_extension: string, file_handler: FileHandlerConstructor) {
    if(STORE[file_type] === undefined) STORE[file_type] = {};
    STORE[file_type][file_extension] = file_handler;
}
export function unregister(file_type: string, file_extension: string) {
    delete STORE[file_type][file_extension];
}

export function getRaw(from_path: string, to_path: string) {
    let tmp = STORE[getFileType(from_path)];
    if(tmp === undefined) return;
    
    return tmp[extname(from_path)];
}
export function get(from_path: string, to_path: string) {
    const FILE_HANDLER = getRaw(from_path, to_path);

    if(FILE_HANDLER !== undefined)
        return new FILE_HANDLER(from_path, to_path);
    else 
        return new DefaultHandler(from_path, to_path);
}

export { FileHandler } from "./HandlerDef";
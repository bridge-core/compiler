import { FileHandlerConstructor } from "./HandlerDef";
export declare function register(file_type: string, file_extension: string, file_handler: FileHandlerConstructor): void;
export declare function unregister(file_type: string, file_extension: string): void;
export declare function get(from_path: string, to_path: string): import("./HandlerDef").IFileHandler;
export { FileHandler } from "./HandlerDef";

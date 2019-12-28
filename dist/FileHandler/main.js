"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../FileType/main");
const path_1 = require("path");
const DefaultHandler_1 = require("./DefaultHandler");
let STORE = {};
function register(file_type, file_extension, file_handler) {
    if (STORE[file_type] === undefined)
        STORE[file_type] = {};
    STORE[file_type][file_extension] = file_handler;
}
exports.register = register;
function unregister(file_type, file_extension) {
    delete STORE[file_type][file_extension];
}
exports.unregister = unregister;
function get(from_path, to_path) {
    const FILE_HANDLER = STORE[main_1.get(from_path)][path_1.extname(from_path)];
    if (FILE_HANDLER !== undefined)
        return new FILE_HANDLER(from_path, to_path);
    else
        return new DefaultHandler_1.DefaultHandler(from_path, to_path);
}
exports.get = get;
var HandlerDef_1 = require("./HandlerDef");
exports.FileHandler = HandlerDef_1.FileHandler;
//# sourceMappingURL=main.js.map
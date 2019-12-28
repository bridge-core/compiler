"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const BasePath_1 = __importDefault(require("./Env/BasePath"));
const main_1 = require("./FileHandler/main");
let HANDLERS = [];
async function processDir(from_path, to_path) {
    let content = await fs_1.promises.readdir(from_path, { withFileTypes: true });
    await Promise.all(content.map(async (dirent) => {
        if (dirent.isDirectory())
            await compile(path_1.join(from_path, dirent.name), path_1.join(to_path, dirent.name));
        else
            HANDLERS.push(main_1.get(path_1.join(from_path, dirent.name), path_1.join(to_path, dirent.name)));
    }));
}
async function compile(from_path, to_path) {
    HANDLERS = [];
    BasePath_1.default.set(from_path);
    await processDir(from_path, to_path);
}
exports.compile = compile;
var main_2 = require("./FileHandler/main");
exports.register = main_2.register;
//# sourceMappingURL=main.js.map
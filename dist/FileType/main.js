"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const file_definitions_1 = __importDefault(require("./file_definitions"));
const path_1 = require("path");
const BasePath_1 = __importDefault(require("../Env/BasePath"));
const lodash_1 = require("lodash");
function get(file_path, get_rp_types = false) {
    let compare_path = path_1.relative(BasePath_1.default.get(), file_path).replace(/\\/g, "/");
    for (let { includes, id, rp_definition = false } of file_definitions_1.default) {
        if (new RegExp(`${lodash_1.escapeRegExp(includes)}.+`).test(compare_path) && rp_definition === get_rp_types)
            return id;
    }
    return "unknown";
}
exports.get = get;
//# sourceMappingURL=main.js.map
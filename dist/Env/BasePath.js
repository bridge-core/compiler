"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let BASE_PATH;
function get() {
    return BASE_PATH;
}
exports.get = get;
function set(base_path) {
    BASE_PATH = base_path;
}
exports.set = set;
exports.default = {
    get,
    set
};
//# sourceMappingURL=BasePath.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HandlerDef_1 = require("./HandlerDef");
const fs_1 = require("fs");
class DefaultHandler extends HandlerDef_1.FileHandler {
    async resolve() {
        return [];
    }
    async transform() {
        await fs_1.promises.copyFile(this.from_path, this.to_path);
    }
}
exports.DefaultHandler = DefaultHandler;
//# sourceMappingURL=DefaultHandler.js.map
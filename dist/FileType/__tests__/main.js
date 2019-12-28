"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
const BasePath_1 = __importDefault(require("../../Env/BasePath"));
test("[BP] FileType.get(file_path)", () => {
    BasePath_1.default.set("C://some/random/path");
    expect(main_1.get("C://some/random/path/entities/test.json")).toBe("entity");
});
test("[BP] FileType.get(unknown_path)", () => {
    BasePath_1.default.set("C://some/random/path");
    expect(main_1.get("C://some/random/path/no_real_file_type/test.json")).toBe("unknown");
});
test("[RP] FileType.get(file_path, true)", () => {
    BasePath_1.default.set("C://some/random/path");
    expect(main_1.get("C://some/random/path/entity/test.json", true)).toBe("client_entity");
});
test("[RP] FileType.get(unknown_path, true)", () => {
    BasePath_1.default.set("C://some/random/path");
    expect(main_1.get("C://some/random/path/no_real_file_type/test.json", true)).toBe("unknown");
});
//# sourceMappingURL=main.js.map
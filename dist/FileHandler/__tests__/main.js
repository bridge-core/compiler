"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
const BasePath_1 = __importDefault(require("../../Env/BasePath"));
test("register, get, unregister", () => {
    BasePath_1.default.set("C://some/random/path");
    main_1.register("entity", ".json", class extends main_1.FileHandler {
        async resolve() {
            return [];
        }
        async transform() {
        }
    });
    expect(main_1.get("C://some/random/path/entities/test.json", "C://some/random/end/location/entities/test.json")).toBeDefined();
    main_1.unregister("entity", ".json");
    expect(main_1.get("C://some/random/path/entities/test.json", "C://some/random/end/location/entities/test.json")).toBeUndefined();
});
//# sourceMappingURL=main.js.map
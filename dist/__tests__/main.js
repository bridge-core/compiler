"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
const main_2 = require("../FileHandler/main");
test("register(type, ext, handler)", () => {
    main_1.register("entity", ".json", class extends main_2.FileHandler {
        async resolve() {
            return [];
        }
        async transform() {
        }
    });
});
test("compile(from, to)", () => {
    main_1.compile("./test/from", "./test/to");
});
//# sourceMappingURL=main.js.map
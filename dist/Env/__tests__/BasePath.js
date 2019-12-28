"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BasePath_1 = require("../BasePath");
test("BasePath", () => {
    const test_string = "string";
    BasePath_1.set(test_string);
    expect(BasePath_1.get()).toBe(test_string);
});
//# sourceMappingURL=BasePath.js.map
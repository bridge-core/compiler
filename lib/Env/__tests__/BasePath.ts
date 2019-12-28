import { get, set } from "../BasePath";

test("BasePath", () => {
    const test_string = "string";
    set(test_string);
    expect(get()).toBe(test_string);
});
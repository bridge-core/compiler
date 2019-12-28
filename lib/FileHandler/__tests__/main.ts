import { register, FileHandler, get, unregister, getRaw } from "../main";
import BasePath from "../../Env/BasePath";

test("register, get, unregister", () => {
    BasePath.set("C://some/random/path");
    register("entity", ".json", class extends FileHandler {
        async resolve() {
            return [];
        }

        async transform() {
        }
    });

    expect(get("C://some/random/path/entities/test.json", "C://some/random/end/location/entities/test.json")).toBeInstanceOf(FileHandler);

    unregister("entity", ".json");

    expect(getRaw("C://some/random/path/entities/test.json", "C://some/random/end/location/entities/test.json")).toBeUndefined();
})
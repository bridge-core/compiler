import { get } from "../main";
import BasePath from "../../Env/BasePath";

test("[BP] FileType.get(file_path)", () => {
    BasePath.set("C://some/random/path");
    expect(get("C://some/random/path/entities/test.json")).toBe("entity");
});
test("[BP] FileType.get(unknown_path)", () => {
    BasePath.set("C://some/random/path");
    expect(get("C://some/random/path/no_real_file_type/test.json")).toBe("unknown");
});

test("[RP] FileType.get(file_path, true)", () => {
    BasePath.set("C://some/random/path");
    expect(get("C://some/random/path/entity/test.json", true)).toBe("client_entity");
});
test("[RP] FileType.get(unknown_path, true)", () => {
    BasePath.set("C://some/random/path");
    expect(get("C://some/random/path/no_real_file_type/test.json", true)).toBe("unknown");
});
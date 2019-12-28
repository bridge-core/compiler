import { compile, register } from "../main";
import { FileHandler } from "../FileHandler/main";
import { promises as fs } from "fs";
import { dirname } from "path";

test("register(type, ext, handler)", () => {
    register("entity", ".json", class extends FileHandler {
        private data: any;
        async resolve() {
            try {
                this.data = (await fs.readFile(this.from_path)).toJSON() || {};
                const { "minecraft:entity": { components, description } } = this.data;
                return <string[]> description.tags || [];
            } catch(e) {
                return [];
            }
        }
        
        async transform() {
            await fs.mkdir(dirname(this.to_path), { recursive: true });
            await fs.writeFile(this.to_path, JSON.stringify(this.data, null, "\t"));
        }
    })
})

test("compile(from, to)", async () => {
    await compile("./test/from", "./test/to");
});
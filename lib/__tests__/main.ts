import { compile, register } from "../main";
import { FileHandler } from "../FileHandler/main";
import { promises as fs } from "fs";
import { dirname } from "path";
import IdentifierMap from "../Env/IdentifierMap";
import { Dependency } from "../DependencyGraph/Dependency";
import { IFileHandler } from "../FileHandler/HandlerDef";
import cJSON from "comment-json";
import { mergeWith } from "lodash";
import { DependencyMap } from "../DependencyGraph/Map";

test("register(type, ext, handler)", () => {
    register("entity", ".json", class extends FileHandler {
        private data: any;
        private tag_imports: string[] = [];

        async declare() {}
        async register() {
            try {
                this.data = cJSON.parse((await fs.readFile(this.from_path)).toString(), undefined, true);
            } catch(e) {
                this.data = {};
            }
            
            const { "minecraft:entity": { components={}, description={} }={} } = this.data;
            let tags = description.tags || [];
            tags.forEach((t: string) => {
                let handle = <IFileHandler> IdentifierMap.get(`entity_tag.${t}`);
                this.tag_imports.push(handle.file_path);
                (<Dependency> DependencyMap.get(this.file_path)).add(<Dependency> DependencyMap.get(handle.file_path));
            });
        }
        
        async resolve() {
            this.tag_imports.map(t => {
                let dep = <Dependency> DependencyMap.get(t);
                let handle = dep.handler;
            });
            await fs.mkdir(dirname(this.to_path), { recursive: true });
            await fs.writeFile(this.to_path, JSON.stringify(this.data, null, "\t"));
        }
    });

    register("entity_tag", ".json", class TagHandler extends FileHandler {
        private data: any;

        async declare() {
            try {
                this.data = cJSON.parse((await fs.readFile(this.from_path)).toString(), undefined, true);
            } catch(e) {
                this.data = {};
            }

            const { description={} } = this.data["bridge:tag"];
            IdentifierMap.set(`entity_tag.${description.identifier}`, this);
        }

        async register() {}
        
        async resolve() {
            await fs.mkdir(dirname(this.to_path), { recursive: true });
            await fs.writeFile(this.to_path, JSON.stringify(this.data, null, "\t"));
        }
    });
})

test("compile(from, to)", async () => {
    await compile("./test/from", "./test/to");
});
import FileDefs from "./file_definitions";
import { relative, join } from "path";
import BasePath from "../Env/BasePath";
import { escapeRegExp as eRE } from "lodash";

export interface FileDefinition {
    id: string;
    includes: string;
    file_viewer: "json" | "";
    rp_definition?: boolean;
    documentation: {
        "base": string;
        "extend": string;
    },
    start_state: string;
    lightning_cache: string;
    highlighter: string,
    file_creator: string,
    problems: string[]
}

export function get(file_path: string, get_rp_types=false) {
    let compare_path = relative(BasePath.get(), file_path).replace(/\\/g, "/");

    for(let { includes, id, rp_definition=false } of <FileDefinition[]> FileDefs) {
        if(new RegExp(`${eRE(includes)}.+`).test(compare_path) && rp_definition === get_rp_types) return id;
    }
    return "unknown";
}
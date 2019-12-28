export interface FileDefinition {
    id: string;
    includes: string;
    file_viewer: "json" | "";
    rp_definition?: boolean;
    documentation: {
        "base": string;
        "extend": string;
    };
    start_state: string;
    lightning_cache: string;
    highlighter: string;
    file_creator: string;
    problems: string[];
}
export declare function get(file_path: string, get_rp_types?: boolean): string;

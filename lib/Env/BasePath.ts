let BASE_PATH: string;

export function get() {
    return BASE_PATH;
}
export function set(base_path: string) {
    BASE_PATH = base_path;
}

export default {
    get,
    set
}

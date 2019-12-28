import { IFileHandler } from "../FileHandler/HandlerDef";

export class Dependency {
    private dependencies = new Set<Dependency>();
    constructor(public handler: IFileHandler) {}

    getDependencies() {
        return this.dependencies;
    }

    add(dep: Dependency) {
        this.dependencies.add(dep);
    }
    remove(dep: Dependency) {
        this.dependencies.delete(dep);
    }
}
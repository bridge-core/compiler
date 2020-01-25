import { IFileHandler } from "../FileHandler/main"

export interface INode {
    readonly dependencies: Set<INode>
    readonly updateNodes: Set<INode>
    readonly fileHandler: IFileHandler

    add: (dep: INode) => void
    remove: (dep: INode) => void
    addUpdateNode: (dep: INode) => void
    removeUpdateNode: (dep: INode) => void
}

export function createNode(fileHandler: IFileHandler): INode {
    let dependencies = new Set<INode>()
    let updateNodes = new Set<INode>()

    return {
        get dependencies() {
            return dependencies
        },
        get updateNodes() {
            return updateNodes
        },
        get fileHandler() {
            return fileHandler
        },
    
        add(dep: INode) {
            dependencies.add(dep)
            dep.addUpdateNode(this)
        },
        remove(dep: INode) {
            dependencies.delete(dep)
            dep.removeUpdateNode(this)
        },

        addUpdateNode(dep: INode) {
            updateNodes.add(dep)
        },
        removeUpdateNode(dep: INode) {
            updateNodes.delete(dep)
        },
    }
}
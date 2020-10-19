export interface INode {
    readonly dependencies: Set<INode | string>;
    readonly absPath: string;
    readonly relPath: string;
    readonly matchPath: string;
    readonly isRpFile: boolean;
    fileContent: unknown;
    add: (dep: INode | string) => void;
    remove: (dep: INode | string) => void;
}
export declare function createNode(absPath: string, relPath: string, fromRp?: boolean): INode;

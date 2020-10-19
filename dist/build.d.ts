import { TCompilerOptions } from './main';
import { INode } from './dependencies/node';
export interface FileTypeResolver {
    match?: string | ((node: INode) => boolean);
    doNotTransfer?: boolean;
    plugins?: ICompilerPlugin[];
}
export interface ICompilerPlugin {
    afterRead: (node: INode) => Promise<unknown> | unknown;
    resolveDependencies?: (node: INode, keyRegistry: Map<string, INode>) => Promise<void> | void;
    transform?: (node: INode) => Promise<unknown> | unknown;
    afterTransform?: (node: INode) => Promise<unknown> | unknown;
}
export declare function resolvePack(absPath: string, relPath: string, dependencyMap: Map<string, INode>, keyRegistry: Map<string, INode>, resolveConfig: FileTypeResolver[], fromRp?: boolean): Promise<void>;
export declare function buildAddOn({ bp, obp, rp, orp, resolve: resolveConfig, }: TCompilerOptions): Promise<void>;

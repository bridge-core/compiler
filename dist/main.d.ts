declare let compilerOptions: {
    [x: string]: unknown;
    bp: string;
    obp: string;
    rp: string;
    orp: string;
};
export declare type TCompilerOptions = typeof compilerOptions;
export { buildAddOn } from './build';

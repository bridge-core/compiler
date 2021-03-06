import { fs } from '../fs'

export interface INode {
	readonly dependencies: Set<INode | string | [string, boolean]>
	readonly absPath: string
	readonly relPath: string
	readonly matchPath: string
	readonly isRpFile: boolean
	fileContent: unknown
	savePath: string

	add: (dep: INode | string) => void
	remove: (dep: INode | string) => void
}

export function createNode(
	absPath: string,
	relPath: string,
	fromRp = false
): INode {
	let dependencies = new Set<INode | string | [string, boolean]>()
	let fileContent: unknown
	let savePath: string

	return {
		get isRpFile() {
			return fromRp
		},
		get absPath() {
			return absPath
		},
		get relPath() {
			return relPath
		},
		get matchPath() {
			return fs.join(fromRp ? 'RP' : 'BP', relPath.replace(/\\/g, '/'))
		},
		get dependencies() {
			return dependencies
		},
		get fileContent() {
			return fileContent
		},
		set fileContent(val: unknown) {
			fileContent = val
		},
		get savePath() {
			return savePath
		},
		set savePath(val: string) {
			savePath = val
		},

		add(dep: INode | string | [string, boolean]) {
			dependencies.add(dep)
		},
		remove(dep: INode | string | [string, boolean]) {
			dependencies.delete(dep)
		},
	}
}

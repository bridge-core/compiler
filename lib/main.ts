import { join } from 'https://deno.land/std@0.74.0/path/mod.ts'
import { AddOnBuilder, IFileTypeResolver } from './build.ts'
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

export interface IPackTypes {
	behaviorPack: string
	resourcePack: string
}

export interface ICompilerOptions {
	input: Partial<IPackTypes>
	output: Partial<IPackTypes>
	resolve?: IFileTypeResolver[]
}

if (import.meta.main) {
	const require = async (path: string) => {
		const scriptFile = await Deno.readTextFile(join(Deno.cwd(), path))
		const scriptFunc = new AsyncFunction('require', 'provide', scriptFile)

		let modExport: Record<string, unknown> | unknown = {}
		let hadDefaultExport = false
		await scriptFunc(require, (keyOrVal: unknown, val?: unknown) => {
			if (val && typeof keyOrVal === 'string' && !hadDefaultExport)
				return ((modExport as Record<string, unknown>)[keyOrVal] = val)

			hadDefaultExport = true
			modExport = val
		})
		return modExport
	}

	const scriptFile = await Deno.readTextFile(
		join(Deno.cwd(), './bridge.config.js')
	)
	const scriptFunc = new AsyncFunction('config', 'require', scriptFile)
	scriptFunc((config: ICompilerOptions) => {
		new AddOnBuilder(config).build()
	}, require)
}

export { AddOnBuilder } from './build.ts'

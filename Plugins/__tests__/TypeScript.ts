import { TCompilerPlugin } from '../../Plugins.ts'
import { TypeScriptPlugin } from '../TypeScript.ts'
import { FileSystem } from './FileSystem.ts'

describe('TypeScript Compiler Plugin', () => {
	const fileSystem = new FileSystem()
	const typeScript = <TCompilerPlugin>TypeScriptPlugin(<any>{
		options: { mode: 'dev' },
		fileSystem,
		compileFiles: async () => {},
		getAliases: () => [],
	})

	it('should transpile TypeScript to JavaScript', () => {
		expect(
			typeScript.load('test.ts', "let x: string = 'Hello World';")
		).toEqual("let x = 'Hello World';\n")
	})

	it('should replace .js extension with .ts', async () => {
		expect(await typeScript.transformPath('test.ts')).toMatch(
			/test_(.+)\.js/
		)
	})
})

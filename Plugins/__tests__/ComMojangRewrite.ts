import { TCompilerPlugin } from '../../Plugins.ts'
import { ComMojangRewrite } from '../ComMojangRewrite.ts'
import { FileSystem } from '../../FileSystem.ts'

describe('ComMojangRewrite Compiler Plugin', () => {
	const fileSystem = new FileSystem()
	const rewrite = <TCompilerPlugin>ComMojangRewrite(<any>{
		options: { mode: 'build' },
		fileSystem,
		compileFiles: async () => {},
		getAliases: () => [],
	})

	it('should put BP into correct folder', () => {
		expect(rewrite.transformPath('BP/entities/test.json')).toEqual(
			'builds/dist/development_behavior_packs/Bridge BP/entities/test.json'
		)
	})
	it('should put RP into correct folder', () => {
		expect(rewrite.transformPath('RP/entity/test.json')).toEqual(
			'builds/dist/development_resource_packs/Bridge RP/entity/test.json'
		)
	})
	it('should put SP into correct folder', () => {
		expect(rewrite.transformPath('SP/textures/skin1.png')).toEqual(
			'builds/dist/skin_packs/Bridge SP/textures/skin1.png'
		)
	})
})

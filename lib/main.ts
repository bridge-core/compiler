import { buildAddOn } from './build'
declare const ENVIRONMENT: 'cli' | 'package'

let compilerOptions: {
	[x: string]: unknown
	bp: string
	obp: string
	rp: string
	orp: string
}

if (ENVIRONMENT === 'cli') {
	;(async () => {
		const yargs = await import('yargs')
		compilerOptions = yargs
			.config(
				'config',
				'Run bridge-compiler with the given config',
				(path) => require(path)
			)
			.usage('Usage: bridge-compiler --config <path>')
			.option('bp', {
				describe: 'Path to your behavior pack',
				type: 'string',
				demandOption: true,
			})
			.option('obp', {
				alias: 'outputbp',
				describe: 'Where to save the compiled behavior pack',
				type: 'string',
				demandOption: true,
			})
			.option('rp', {
				describe: 'Path to your resource pack',
				type: 'string',
				demandOption: true,
			})
			.option('orp', {
				alias: 'outputrp',
				describe: 'Where to save the compiled resource pack',
				type: 'string',
				demandOption: true,
			}).argv

		buildAddOn(compilerOptions, { ...require('fs'), ...require('path') })
	})()
}

export type TCompilerOptions = typeof compilerOptions

export { buildAddOn } from './build'

import yargs from 'yargs'
import { buildAddOn } from './build'

const compilerOptions = yargs
	.config('config', 'Run bridge-compiler with the given config', (path) =>
		require(path)
	)
	.usage('Usage: $0 --bp <path> --obp <path> --rp <path> --orp <path>')
	.usage('Usage: $0 --config <path>')
	.option('bp', {
		describe: 'Path to your behavior pack',
		type: 'string',
		demandOption: true,
	})
	.option('obp', {
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
		describe: 'Where to save the compiled resource pack',
		type: 'string',
		demandOption: true,
	}).argv

export type TCompilerOptions = typeof compilerOptions

buildAddOn(compilerOptions)

import pkg from './package.json'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

export default (commandLineArgs) => {
	return {
		input: 'lib/main.ts',

		output: [
			{
				banner: '#!/usr/bin/env node',
				intro: 'const ENVIRONMENT = "node-cli";',
				file: pkg.cli,
				format: 'cjs',
			},
			{
				intro: 'const ENVIRONMENT = "package";',
				file: pkg.main,
				format: 'cjs',
			},
			{
				intro: 'const ENVIRONMENT = "package";',
				file: pkg.module,
				format: 'es',
			},
			{
				intro: 'const ENVIRONMENT = "package";',
				file: pkg.browser,
				format: 'iife',
				name: 'MoLang',
			},
		],
		plugins: [
			typescript({
				typescript: require('typescript'),

				tsconfigOverride: {
					compilerOptions: {
						outDir: 'dist',
						module: 'ESNext',
					},
				},
			}),
			commonjs(),
			terser(),
		],
	}
}

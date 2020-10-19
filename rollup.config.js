import pkg from './package.json'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import json from '@rollup/plugin-json'

export default (commandLineArgs) => {
	return {
		input: 'lib/main.ts',

		output: [
			{
				banner: '#!/usr/bin/env node',
				file: pkg.main,
				format: 'cjs',
			},
			{
				banner: '#!/usr/bin/env node',
				file: pkg.module,
				format: 'es',
			},
			{
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
			json(),
		],
	}
}

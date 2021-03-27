import * as Comlink from 'https://cdn.skypack.dev/comlink'
import { TaskService } from '/@/components/TaskManager/WorkerTask'
import { loadPlugins, TCompilerPlugin } from './Plugins.ts'
import { FileSystem } from './FileSystem.ts'
import { FileType, IFileType } from '/@/components/Data/FileType'
import { Compiler } from './Compiler.ts'

export interface ICompilerOptions {
	projectDirectory: FileSystemDirectoryHandle
	baseDirectory: FileSystemDirectoryHandle
	config: string
	mode: 'dev' | 'build'
	plugins: Record<string, string>
	pluginFileTypes: IFileType[]
}
export interface IBuildConfig {
	mode: 'dev' | 'build'

	createFiles: string[]
	plugins: TPluginDef[]
}
export type TPluginDef = string | [string, any]

export class CompilerService extends TaskService<void, string[]> {
	protected buildConfig!: IBuildConfig
	protected plugins!: Map<string, Partial<TCompilerPlugin>>
	protected compiler: Compiler = new Compiler(this)

	constructor(protected readonly options: ICompilerOptions) {
		super('compiler', options.projectDirectory)
		FileType.setPluginFileTypes(options.pluginFileTypes)
	}

	getOptions() {
		return this.options
	}
	getPlugins() {
		return this.plugins
	}
	get pluginOpts() {
		return Object.fromEntries(
			this.buildConfig.plugins.map((def) =>
				Array.isArray(def)
					? [def[0], { ...def[1], mode: this.options.mode }]
					: [def, { mode: this.options.mode }]
			)
		)
	}

	async onStart(updatedFiles: string[]) {
		const globalFs = new FileSystem(this.options.baseDirectory)
		await FileType.setup(globalFs)

		try {
			this.buildConfig = await this.fileSystem.readJSON(
				`bridge/compiler/${this.options.config}`
			)
		} catch {
			return
		}

		await this.loadPlugins(this.options.plugins)

		await this.compiler.runWithFiles(updatedFiles)
	}

	async updateFile(filePath: string) {
		await this.loadPlugins(this.options.plugins)
		await this.compiler.runWithFiles([filePath])
	}

	async loadPlugins(plugins: Record<string, string>) {
		const globalFs = new FileSystem(this.options.baseDirectory)

		this.plugins = await loadPlugins({
			fileSystem: globalFs,
			pluginPaths: plugins,
			localFs: this.fileSystem,
			pluginOpts: this.pluginOpts,
			compileFiles: (files: string[]) =>
				this.compiler.compileFiles(files),
			getAliases: (filePath: string) =>
				this.compiler.getAliases(filePath),
		})
	}
	async updatePlugins(
		plugins: Record<string, string>,
		pluginFileTypes: IFileType[]
	) {
		await this.loadPlugins(plugins)
		FileType.setPluginFileTypes(pluginFileTypes)
	}
	updateMode(mode: 'dev' | 'build') {
		this.options.mode = mode
	}
}

Comlink.expose(CompilerService, self)

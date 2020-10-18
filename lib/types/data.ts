declare module 'bridge-data/dist/file-definitions' {
	interface FileDefinition {
		id?: string
		target_version?: string
		includes?: string
		file_viewer?: 'json' | 'text' | 'model'
		rp_definition?: boolean

		build_array_exceptions?: string[]
		default_build_arrays?: boolean
		documentation?: string
		start_state?: string
		lightning_cache?: string
		highlighter?: string
		language?: string
		problems?: string[]
		snippets?: string
		text_separators?: string[]
		comment_character?: string
	}

	export default function (): FileDefinition[]
}

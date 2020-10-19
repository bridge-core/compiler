import fileTypes from './file_definitions.json'

export function get(path: string, fromRp = false) {
	path = path.replace(/\\/g, '/')

	for (const { id, rp_definition, includes } of fileTypes) {
		if (!!rp_definition === !fromRp) continue

		if (path.startsWith(includes)) {
			// console.log(id ?? 'unknown')
			return id ?? 'unknown'
		}
	}

	// console.log('unknown')
	return 'unknown'
}

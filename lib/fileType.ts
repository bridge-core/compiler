import getFileTypes from 'bridge-data/dist/file-definitions'

const fileTypes = getFileTypes()

export function get(path: string, fromRP = false) {
	path = path.replace(/\\/g, '/')

	for (const { id, rp_definition, includes } of fileTypes) {
		if (!!rp_definition !== !fromRP) continue

		if (path.startsWith(`./${includes}`)) return id ?? 'unknown'
	}

	return 'unknown'
}

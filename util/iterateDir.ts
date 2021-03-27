export async function iterateDir(
	baseDirectory: string,
	callback: (
		fileHandle: Deno.DirEntry,
		path: string
	) => Promise<void> | void,
	path = ''
) {
	for await (const handle of Deno.readDir(baseDirectory)) {
		const currentPath =
			path.length === 0 ? handle.name : `${path}/${handle.name}`

		if (handle.isFile) {
			if (handle.name[0] === '.') continue
			await callback(handle, currentPath)
		} else if (handle.isDirectory) {
			await iterateDir(handle.name, callback, currentPath)
		}
	}
}

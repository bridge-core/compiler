import { promises as fs } from 'fs'
import { join } from 'path'

export async function iterateDir(
	absPath: string,
	relPath: string,
	callback: (absPath: string, relPath: string) => Promise<void> | void
) {
	let dirents = await fs.readdir(absPath, { withFileTypes: true })
	let filePaths: [string, string][] = []

	await Promise.all(
		dirents.map(async (dirent) => {
			if (dirent.isFile())
				await callback(
					join(absPath, dirent.name),
					join(relPath, dirent.name)
				)
			else
				await iterateDir(
					join(absPath, dirent.name),
					join(relPath, dirent.name),
					callback
				)
		})
	)

	return filePaths
}

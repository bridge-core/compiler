import { fs } from './fs'

export async function iterateDir(
	absPath: string,
	relPath: string,
	callback: (absPath: string, relPath: string) => Promise<void>
) {
	let dirents = await fs.readdir(absPath, { withFileTypes: true })
	let filePaths: [string, string][] = []

	await Promise.all(
		dirents.map(async (dirent) => {
			if (dirent.isFile())
				await callback(
					fs.join(absPath, dirent.name),
					fs.join(relPath, dirent.name)
				)
			else
				await iterateDir(
					fs.join(absPath, dirent.name),
					fs.join(relPath, dirent.name),
					callback
				)
		})
	)

	return filePaths
}

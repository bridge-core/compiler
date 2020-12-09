import { join } from 'https://deno.land/std@0.74.0/path/mod.ts'

export async function iterateDir(
	absPath: string,
	relPath: string,
	callback: (absPath: string, relPath: string) => Promise<void>
) {
	for await (const dirEntry of Deno.readDir(absPath)) {
		if (dirEntry.isFile)
			await callback(
				join(absPath, dirEntry.name),
				join(relPath, dirEntry.name)
			)
		else
			await iterateDir(
				join(absPath, dirEntry.name),
				join(relPath, dirEntry.name),
				callback
			)
	}
}

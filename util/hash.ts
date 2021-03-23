// Node doesn't know TextDecoder so we skip it for our tests
const textDecoder = isNode() ? { encode: () => undefined } : new TextEncoder()

export async function hashString(str: string) {
    const rawData = textDecoder.encode(str)
	if (!rawData) return ''
    
	const hashedData = await hash(rawData)
    
	return toHexString(hashedData)
}

export async function hash(data: Uint8Array) {
    return new Uint8Array(await crypto.subtle.digest('sha-1', data))
}

function toHexString(data: Uint8Array) {
    return Array.from(data)
    .map(b => ('00' + b.toString(16)).slice(-2))
    .join('')
}

function isNode() {
    return false;
    // try {
    //     return typeof process !== 'undefined' && process.release.name === 'node'
    // } catch {
    //     return false
    // }
}
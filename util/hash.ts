import {createHash} from "https://deno.land/std@0.80.0/hash/mod.ts";

// Node doesn't know TextDecoder so we skip it for our tests
const textDecoder = new TextEncoder()
export async function hashString(str: string) {
    const rawData = textDecoder.encode(str)
	if (!rawData) return ''
    
	const hashedData = await hash(rawData)
    
	return toHexString(hashedData)
}

export function hash(data: Uint8Array) {
    const hasher = createHash('sha1')
    hasher.update(data)
    return new Uint8Array(hasher.digest())
}

function toHexString(data: Uint8Array) {
    return Array.from(data)
    .map(b => ('00' + b.toString(16)).slice(-2))
    .join('')
}
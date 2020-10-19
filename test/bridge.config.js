const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
const components = new Map()
function customComponents() {
	return {
		entity: {
			resolveDependencies(node) {
				const entity = node.fileContent['minecraft:entity']
				if (entity && entity.components) {
					for (let key of Object.keys(entity.components)) {
						if (!key.startsWith('minecraft')) node.add(key)
					}
				}
			},
			transform(node) {
				const entity = node.fileContent['minecraft:entity']
				if (entity && entity.components) {
					for (let [key, data] of Object.entries(entity.components)) {
						if (components.has(key)) {
							console.log('Ready to add ' + key)
							delete entity.components[key]
						}
					}
				}
			},
		},
		custom_component: {
			resolveDependencies(node, keyRegistry) {
				const script = new AsyncFunction('Bridge', node.fileContent)
				script({
					register(component) {
						if (!component.component_name) return

						keyRegistry.set(component.component_name, node)
						components.set(
							component.component_name,
							new component()
						)
					},
				})
			},
		},
	}
}

function asJSON() {
	return {
		afterRead(node) {
			return eval(`(${node.fileContent.toString('utf-8')})`)
		},
		afterTransform(node) {
			return JSON.stringify(node.fileContent, null, '\t')
		},
	}
}
function asString() {
	return {
		afterRead(node) {
			return node.fileContent.toString('utf-8')
		},
	}
}

module.exports = {
	bp: './test/BP', // Path to your behavior pack
	obp: './test/build/BP', // Where to store the compiled behavior pack
	rp: './test/RP', // Path to your resource pack
	orp: './test/build/RP', // Where to store the compiled resource pack
	resolve: [
		{
			match: 'BP/components/',
			doNotTransfer: true,
			plugins: [asString(), customComponents().custom_component],
		},
		{
			match: 'BP/entities/',
			plugins: [asJSON(), customComponents().entity],
		},
	],
}

# IMPORTANT
This compiler is currently outdated. For the new API shape see the [Plugins.ts](https://github.com/bridge-core/editor/blob/dev/src/components/Compiler/Worker/Plugins.ts#L18) file. We will update this repository to create a CLI for compiling bridge. projects soon.


# bridge-compiler
Provides the architecture to compile bridge.'s custom syntax without the use of a cache in the background.

This package will replace the default bridge. cache system in the future.

## Usage

1. Run `npm i -g bridge-compiler`
2. Create a config file for the compiler (`bridge.config.js`)
3. Run `bridge-compiler --config ./bridge.config.js` to compile the project

## Example Config
In this example, the `bridge/` folder contains compiler plugins.

```javascript
const { homedir } = require('os')
const anyLanguage = require('./bridge/anyLanguage')
const {
	registerCustomComponents,
	resolveCustomComponents,
} = require('./bridge/customComponents')
const { asString, asJSON } = require('./bridge/utils')

module.exports = {
	bp: './AstroExp BP',
	rp: './AstroExp RP',
	obp: `${homedir()}/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/development_behavior_packs/AstroExp BP`,
	orp: `${homedir()}/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/development_resource_packs/AstroExp RP`,
	resolve: [
		{
			match: 'BP/blocks',
			plugins: [asJSON(), resolveCustomComponents('block')],
		},
		{
			match: 'BP/entities',
			plugins: [asJSON(), resolveCustomComponents('entity')],
		},
		{
			match: 'BP/items',
			plugins: [asJSON(), resolveCustomComponents('item')],
		},
		{
			match: 'BP/components',
			doNotTransfer: true,
			plugins: [asString(), registerCustomComponents()],
		},
		{
			match: 'RP/texts/en_US.lang',
			plugins: [asString(), anyLanguage()],
		},
		{
			match: 'BP/bridge',
			doNotTransfer: true,
		},
	],
}
```

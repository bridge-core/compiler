function customComponents() {
	return {
		resolveDependencies() {},
		transform() {},
	}
}

module.exports = {
	bp: 'solved',
	rp: '',
	resolve: {
		entity: {
			plugins: [customComponents()],
		},
	},
}

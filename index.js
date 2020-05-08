/* eslint indent: "off" */

const path = require('path');

const {
	generateCacheIdentifiers,
	generateTranspileDepRegex,
	loadBabelConfig
} = require('./utils');

module.exports = function (api, options) {
	const babelConfig = loadBabelConfig(api, options);

	api.chainWebpack(config => {
		config.resolveLoader.modules.prepend(path.join(__dirname, 'node_modules'));

		const transpileDepRegex = generateTranspileDepRegex(options.transpileDependencies || []);
		config.module
			.rule('js')
				.test(/\.m?js$/)
				.exclude
					.add(filepath => {
						// transpile titanium-vdom and titanium-navigator
						if (/node_modules\/titanium-(navigator|vdom)/.test(filepath)) {
							return false;
						}

						// check if this is something the user explicitly wants to transpile
						if (transpileDepRegex && transpileDepRegex.test(filepath)) {
							return false;
						}

						// Don't transpile all other node_modules
						return /node_modules/.test(filepath);
					})
					.end()
				.use('cache-loader')
					.loader('cache-loader')
					.options(api.generateCacheConfig(
						'babel-loader',
						generateCacheIdentifiers(babelConfig),
						[ 'babel.config.js' ]
					))
					.end()
				.use('babel-loader')
					.loader('babel-loader')
					.options(babelConfig.options);
	});
};

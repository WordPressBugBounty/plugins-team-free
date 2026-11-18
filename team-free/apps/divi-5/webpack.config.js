const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

/**
 * Divi 5 module bundle.
 *
 * Built by its own webpack rather than wp-scripts: Divi's visual builder hands
 * React and every `window.divi.*` package in on the global scope, so the bundle
 * must NOT carry its own copy of them, and the build has to sit next to a
 * module.json that Divi reads from PHP.
 */
module.exports = {
	entry: './src/index.jsx',

	// Divi provides React on the global scope; bundling a second copy breaks
	// hooks in the visual builder.
	externals: {
		react: 'React',
	},

	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							['@babel/preset-env', { modules: false, targets: '> 5%' }],
							'@babel/preset-react',
						],
					},
				},
			},
		],
	},

	resolve: {
		extensions: ['.js', '.jsx'],
	},

	// module.json is read by PHP (ModuleRegistration) as well as imported by the
	// bundle, so it has to exist as a file next to the script.
	plugins: [
		new CopyPlugin({
			patterns: [{ from: 'src/module.json', to: 'module.json' }],
		}),
	],

	output: {
		filename: 'sptp-divi5-team.js',
		path: path.resolve(__dirname, '../../dist/divi5'),
	},
};

const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: {
        bundle: path.join(__dirname, 'lib', 'react', 'client.jsx'),
        test: path.join(__dirname, 'lib', 'react', 'client.jsx')
    },
    output: {
        path: path.join(__dirname, 'public', 'js'),
        filename: '[name].js'
    },
    module: {
        loaders: [{
            test: path.join(__dirname, 'lib'),
            loader: 'babel-loader',
            options: {
                cacheDirectory: 'babel_cache',
                presets: ['react', 'es2015']
            }
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),
        //new webpack.optimize.DedupePlugin(),
        //new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false },
            mangle: true,
            sourcemap: false,
            beautify: false,
            dead_code: true
        })
    ]
};

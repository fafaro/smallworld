const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    context: path.resolve(__dirname, "src"),
    entry: './index.tsx',
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    module: {
        rules: [
            { test: /\.tsx?$/, use: 'ts-loader' }
        ]
    },
    devServer: {
        contentBase: path.resolve(__dirname, "dist"),
        host: '0.0.0.0',
        port: 8080,
        disableHostCheck: true
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: '*.html' },
            { from: '*.ico' },
            { from: '../assets/*', to: 'assets/[name].[ext]'}
        ])
    ]
};
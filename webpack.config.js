const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    context: path.resolve(__dirname, "src"),
    entry: {
        index: './index.tsx',
        index2: './index2.tsx',
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: 'bundle.[name].js'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    module: {
        rules: [
            { test: /\.tsx?$/, use: 'ts-loader' },
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            {
              test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
              loader: 'file-loader'
            },
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
        ]),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
    ]
};
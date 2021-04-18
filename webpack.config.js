const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader').VueLoaderPlugin;

const dev = process.env.NODE_ENV === 'development';

module.exports = {
    devtool: dev ? 'inline-cheap-source-map' : false,
    entry: './src/index.ts',

    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'build'),
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html',
        }),
        new VueLoaderPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    {loader: 'css-loader', options: {sourceMap: true}},
                ]
            },
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js', '.vue' ],
    },
};

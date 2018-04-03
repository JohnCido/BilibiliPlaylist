//var fs = require('fs')
var webpack = require('webpack')
var path = require('path')
var CopyFilesPlugin = require('copy-webpack-plugin')
var UglifyJsPlugin = require('webpack-uglify-js-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

const isDevelopMode = process.env.NODE_ENV === 'develop'
const directory = isDevelopMode ? 'develop' : 'production'

module.exports = {
    mode: isDevelopMode ? 'development' : 'production',
    devtool: isDevelopMode ? 'inline-source-map' : 'nosources-source-map',
    entry: {
        main: path.resolve(__dirname, 'src/js/main.js'),
        favorite: path.resolve(__dirname, 'src/js/content-page/favorite.js'),
        video: path.resolve(__dirname, 'src/js/content-page/video.js'),
        popup: path.resolve(__dirname, 'src/js/popup.js')
    },
    output: {
        path: path.resolve(__dirname, `${directory}/`),
        filename: '[name].js'
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            }, {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        'css-loader',
                        'less-loader'
                    ],
                    fallback: 'style-loader'
                })
            }, {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        'css-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: false,
                                includePaths: [path.resolve(__dirname,'node_modules')]
                            }
                        }
                    ],
                    fallback: 'style-loader'
                })
            }, {
                test: /\.pug$/,
                exclude: /node_modules/,
                use: 'pug-loader'
            }, {
                test: /\.vue$/,
                exclude: /node_modules/,
                use: 'vue-loader'
            }, {
                test: /\.(png|jpg|jpeg|woff|woff2|eot|ttf|svg)$/,
                use: 'url-loader'
            }
        ]
    },

    resolve: {
        extensions: ['.js', '.es6', '.json', '.less', '.vue', '.scss']
    },

    plugins: [
        new CopyFilesPlugin([
            { from: 'src/manifest.json', to: `./manifest.json` },
            { from: 'src/html', to: `./` },
            { from: 'src/_locales', to: `./_locales` },
            { from: 'src/img', to: `./img` },
        ], {
            ignore: [ '.*' ],
            copyUnmodified: true,
            debug: 'warning'
        }),
        new ExtractTextPlugin({filename: '[name].css', disable: false, allChunks: true})
    ],

    optimization: {
        splitChunks: {
            name: 'common'
        }
    }
}

if (!isDevelopMode) {
    module.exports.plugins.push(
        new UglifyJsPlugin({
            cacheFolder: path.resolve(__dirname, 'cache/uglify'),
            debug: false,
            minimize: true,
            sourceMap: true,
            output: {
                comments: false
            },
            compressor: {
                warnings: false
            },
            output: {
                ascii_only: true,
                beautify: false
            }
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: 'production'
            }
        })
    )
}
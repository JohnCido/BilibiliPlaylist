var webpack = require('webpack')
var path = require('path')
var CopyFilesPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

const isDevelopMode = process.env.NODE_ENV === 'develop'
const directory = isDevelopMode ? 'develop' : 'production'

module.exports = {
    mode: isDevelopMode ? 'development' : 'production',
    devtool: isDevelopMode ? 'inline-source-map' : 'nosources-source-map',
    entry: {
        main: path.resolve(__dirname, 'src/js/main.ts'),
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
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'ts-loader'
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
                                includePaths: [ path.resolve(__dirname, 'node_modules') ]
                            }
                        }
                    ],
                    fallback: 'style-loader'
                })
            }, {
                test: /\.pug$/,
                exclude: /node_modules/,
                use: 'pug-plain-loader'
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
        extensions: ['.js', '.ts', '.es6', '.json', '.less', '.vue', '.scss']
    },

    plugins: [
        new VueLoaderPlugin(),
        new CopyFilesPlugin([
            { from: 'src/manifest.json', to: './manifest.json' },
            { from: 'src/html', to: './' },
            { from: 'src/_locales', to: './_locales' },
            { from: 'src/img/icons', to: './img/icons' }
        ], {
            ignore: [ '.*' ],
            copyUnmodified: true,
            debug: 'warning'
        }),
        new ExtractTextPlugin({ filename: '[name].css', disable: false, allChunks: true }),
        ...(isDevelopMode ? [] : [
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify('production')
                }
            })
        ])
    ],

    optimization: {
        splitChunks: {
            name: 'common'
        },
        ...(isDevelopMode ? {} : {
            minimizer: [
                new TerserPlugin({
                    cache: true,
                    parallel: true,
                    terserOptions: {
                        ecma: 6,
                        output: {
                            ascii_only: true
                        }
                    }
                })
            ]
        })
    }
}

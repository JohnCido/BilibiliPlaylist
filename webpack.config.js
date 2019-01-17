var webpack = require('webpack')
var path = require('path')
var CopyFilesPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = env => {
    const mode = env.NODE_ENV
    const dev = mode === 'development'

    return {
        mode,
        devtool: dev ? 'inline-source-map' : 'nosources-source-map',
        entry: {
            background: './src/js/main.ts',
            favorite: './src/js/content-page/favorite.ts',
            video: './src/js/content-page/video.ts',
            popup: './src/js/popup.ts'
        },
        output: {
            path: path.resolve(__dirname, 'webpackout/'),
            filename: '[name].js'
        },

        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: 'babel-loader'
                },
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            appendTsSuffixTo: [/\.vue$/]
                        }
                    }
                },
                {
                    test: /\.less$/,
                    use: ExtractTextPlugin.extract({
                        use: [
                            'css-loader',
                            'less-loader'
                        ],
                        fallback: 'style-loader'
                    })
                },
                // {
                //     test: /\.scss$/,
                //     use: ExtractTextPlugin.extract({
                //         use: [
                //             'css-loader',
                //             {
                //                 loader: 'sass-loader',
                //                 options: {
                //                     sourceMap: false,
                //                     includePaths: [ './node_modules' ]
                //                 }
                //             }
                //         ],
                //         fallback: 'style-loader'
                //     })
                // },
                {
                    test: /\.pug$/,
                    exclude: /node_modules/,
                    use: 'pug-plain-loader'
                },
                {
                    test: /\.vue$/,
                    exclude: /node_modules/,
                    use: 'vue-loader'
                },
                {
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
            ...(dev ? [
            ] : [
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
            ...(dev ? {} : {
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
}

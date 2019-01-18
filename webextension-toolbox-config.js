const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const TerserPlugin = require('terser-webpack-plugin')

const extensions = ['.js', '.ts', '.json', '.less', '.vue']

const rateExtensionURLs = {
    chrome: 'https://chrome.google.com/webstore/detail/odahjnmjnhojohklinapjaokgaccfaba/reviews',
    firefox: 'https://addons.mozilla.org/firefox/addon/bilist/'
}

module.exports = {
    webpack: (config, { dev, vendor }) => {
        config.devtool = dev ? 'inline-source-map' : 'nosources-source-map'
        config.entry = {
            background: './js/main.ts',
            favorite: './js/content-page/favorite.ts',
            video: './js/content-page/video.ts',
            popup: './js/popup.ts'
        }
        config.module.rules = [
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
            },
            {
                test: /webextension-polyfill[\\/]+dist[\\/]+browser-polyfill\.js$/,
                loader: 'string-replace-loader',
                query: {
                    search: 'typeof browser === "undefined"',
                    replace: 'typeof window.browser === "undefined" || Object.getPrototypeOf(window.browser) !== Object.prototype'
                }
            }
        ]
        config.resolve.extensions = extensions
        config.plugins.push(
            new VueLoaderPlugin(),
            new ExtractTextPlugin({ filename: '[name].css', disable: false, allChunks: true }),
            new webpack.DefinePlugin({
                $$RATE_EXT$$: JSON.stringify(rateExtensionURLs[vendor])
            })
        )

        config.optimization = {
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

        return config
    },
    copyIgnore: extensions.map(extension => `**/*${extension}`)
}

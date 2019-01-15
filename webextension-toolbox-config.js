// const webpack = require('webpack')

module.exports = {
    webpack: (config, { dev, vendor }) => {
        config.module.rules = [{
            test: /webextension-polyfill[\\/]+dist[\\/]+browser-polyfill\.js$/,
            loader: 'string-replace-loader',
            query: {
                search: 'typeof browser === "undefined"',
                replace: 'typeof window.browser === "undefined" || Object.getPrototypeOf(window.browser) !== Object.prototype'
            }
        }]
        config.resolve.extensions = []
        return config
    }
}

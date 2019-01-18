module.exports = {
    root: true,
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        node: true
    },
    globals: {
        '$$RATE_EXT$$': true
    },
    extends: 'standard',
    parser: 'typescript-eslint-parser',
    parserOptions: {
        sourceType: 'module'
    },
    plugins: [
        'html',
        'typescript'
    ],
    rules: {
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
        indent: [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        quotes: [
            'error',
            'single'
        ],
        semi: [
            'error',
            'never'
        ],
        'no-new': 'off',
        'standard/no-callback-literal': 'off'
    }
}

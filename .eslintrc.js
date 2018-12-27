module.exports = {
    root: true,
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        node: true
    },
    extends: 'standard',
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module'
    },
    plugins: [
        'html'
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
        ]
    }
}

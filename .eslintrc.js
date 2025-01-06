const { config } = require('@dhis2/cli-style')

module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    extends: [config.eslintReact,
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    globals: {
        cy: 'readonly',
        Cypress: 'readonly',
    },
    rules: {
        'import/extensions': [2, 'ignorePackages'],
         "react/jsx-no-target-blank": "off"
    },
    overrides: [
        {
            files: ['*.test.js'],
            rules: {
                'no-unused-vars': 'off',
            },
        },
    ],
}

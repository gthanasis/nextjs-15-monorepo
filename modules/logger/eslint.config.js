// eslint.config.js
const customConfig = require('eslint-config-custom')

module.exports = [
    // Include the custom configuration
    ...customConfig,

    // Add any additional overrides or custom rules as needed
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        ignores: ['node_modules/**'],
        languageOptions: {
            ecmaVersion: 'latest', // Optional: Specify the ECMAScript version you want to use
            sourceType: 'module'
        },
        settings: {
            // Define environments here instead of using `env`
            env: {
                es2021: true, // Enables ES2021 globals
                node: true // Enables Node.js globals and scoping
            }
        },
        rules: {
            // Define any specific rules if needed
        }
    }
]

module.exports = {
    setupFilesAfterEnv: ['<rootDir>/src/test-utils/setup-tests.js'],
    collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/{setupTests.js}'],
    coveragePathIgnorePatterns: ['/node_modules/', '/src/locales/'],
    moduleNameMapper: {
        '\\.css$': 'identity-obj-proxy',
    },
    
    testEnvironment: 'jsdom', // or 'node'
    globals: {
        Uint8Array: Uint8Array,
    },
    preset: 'ts-jest',
}

module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/test-utils/setup-tests.js'],
    collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/{setupTests.js}'],
    coveragePathIgnorePatterns: ['/node_modules/', '/src/locales/'],
    moduleNameMapper: {
        '\\.css$': 'identity-obj-proxy',
    },
    // testEnvironment: "jest-environment-jsdom",
    // testEnvironment: 'jest-fixed-jsdom',
    // testEnvironmentOptions: {
    //     customExportConditions: [''],
    // },
}

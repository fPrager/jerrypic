module.exports = {
    verbose: true,
    bail: true,
    collectCoverage: false,
    testRegex: '\\.(jest|unit)\\.js?$',
    coveragePathIgnorePatterns: [
        './node_modules',
    ],
    moduleFileExtensions: [
        'js',
        'jsx',
    ],
    moduleDirectories: [
        './node_modules',
    ],
    moduleNameMapper: {
        '^jimp': '<rootDir>/_mocks/jimp/jimp.js',
    },
};

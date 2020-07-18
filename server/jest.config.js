const path = require('path');

module.exports = {
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testEnvironment: 'node',
  testRegex: '.*\\.(test|spec)?\\.(ts|tsx)$',
  moduleFileExtensions: [
    'js',
    'json',
    'jsx',
    'node',
    'ts',
    'tsx',
  ],
  moduleNameMapper: {
    '^exceptions/(.*)$': path.resolve('./src/exceptions') + '/$1',
    '^model/(.*)$': path.resolve('./src/model') + '/$1'
  },
  preset: 'ts-jest',
  testMatch: null,
}
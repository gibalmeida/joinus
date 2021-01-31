const path = require('path')

module.exports = {
  preset: 'ts-jest',
  testEnvironment: path.join(__dirname, 'tests', 'nexus-test-environment.js'),
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
}
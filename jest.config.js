module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test', '<rootDir>/src'],
  testMatch: ['**/test/**/*.spec.ts', '**/test/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!**/*.spec.ts',
    '!**/*.test.ts',
    '!**/*-test.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^./country-codes.json$': '<rootDir>/src/country-codes.json',
  },
};


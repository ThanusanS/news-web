const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.stories.{js,jsx}',
    '!src/pages/_app.jsx',
    '!src/pages/_document.jsx',
  ],
  coverageThreshold: {
    global: { branches: 60, functions: 60, lines: 70, statements: 70 },
  },
};

module.exports = createJestConfig(customJestConfig);

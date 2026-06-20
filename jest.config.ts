// @ts-nocheck
import nextJest from 'next/jest.js';

// Connect Jest with the Next.js framework environment
const createJestConfig = nextJest({
  dir: './',
});

const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
};

export default createJestConfig(config);

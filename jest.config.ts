import type { Config } from 'jest'
import nextJest from 'next/jest.js'

// Connect Jest with the Next.js framework environment
const createJestConfig = nextJest({
    dir: './',
})

// Define core configuration settings for execution
const config: Config = {
    coverageProvider: 'v8',
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
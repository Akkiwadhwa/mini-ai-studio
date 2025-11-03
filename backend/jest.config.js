// backend/jest.config.mjs
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  // compile TS in ESM mode
  transform: { '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: './tsconfig.json' }] },
  extensionsToTreatAsEsm: ['.ts'],
  // let bare TS imports without ".js" work in tests
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  // avoid accidentally running compiled JS from dist
  testPathIgnorePatterns: ['/dist/'],
  // ts-jest warning wants this in tsconfig, but you can keep it here as well
  globals: { 'ts-jest': { isolatedModules: true } },
  verbose: true,
};

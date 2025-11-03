/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { useESM: true } // 👈 new location for ts-jest options
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  verbose: true,
};

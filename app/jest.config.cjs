/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  clearMocks: true,
  moduleNameMapper: {
    '^react-native-mmkv$': '<rootDir>/test/mocks/react-native-mmkv.ts',
  },
  testMatch: ['<rootDir>/src/**/__tests__/**/*.(test|spec).{ts,tsx}'],
};

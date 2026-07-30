/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  clearMocks: true,
  testMatch: ['<rootDir>/src/**/__tests__/**/*.(test|spec).{ts,tsx}'],
};

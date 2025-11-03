import '@testing-library/jest-dom';

// Mock browser-only APIs for jsdom
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

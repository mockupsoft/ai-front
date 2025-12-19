import '@testing-library/jest-dom';

// Mock TextEncoder/TextDecoder for jsdom
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
  })
);

// Mock env vars
process.env.NEXT_PUBLIC_MGX_API_BASE_URL = "http://localhost:8000/api/mgx";


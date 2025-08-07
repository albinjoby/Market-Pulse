// Setup file for Jest tests
import { expect } from "@jest/globals";

// Set longer timeout for API calls
jest.setTimeout(30000);

// Mock console.log for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};

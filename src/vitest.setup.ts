import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import { afterEach, beforeEach, expect, vi } from 'vitest';

expect.extend(matchers);

if (import.meta.env.CI) {
  // Hide all console output
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
} else {
  // vitest does not support canvas with threads on. we have vega configured to use svg in tests,
  // but it still tries to load the canvas lib, triggering a warning. this snipped suppresses that warning.
  const rawError = console.error;
  const canvasError =
    'Not implemented: HTMLCanvasElement.prototype.getContext (without installing the canvas npm package)';
  console.error = (message: unknown, ...args: unknown[]) => {
    if (
      (typeof message === 'string' && message.includes(canvasError)) ||
      (message instanceof Error && message.message.includes(canvasError))
    ) {
      return;
    }
    rawError(message, ...args);
  };
}

beforeEach(() => {
  vi.stubEnv('LOCALE', 'en-US');
});
afterEach(cleanup);

// make jest things think vitest is jest
// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Uhhh
// @ts-ignore
global.jest = vi;

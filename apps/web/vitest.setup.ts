import '@testing-library/jest-dom/vitest';

// Node 22+ ships its own experimental global `localStorage`/`sessionStorage`.
// vitest 1.x's jsdom environment setup sees that key already exists on the
// Node global and skips overriding it with jsdom's real implementation,
// leaving `localStorage` undefined in tests. vitest stashes the raw JSDOM
// instance on `globalThis.jsdom` — use that to force-bind the real storage.
const jsdomInstance = (globalThis as any).jsdom;
if (jsdomInstance?.window?.localStorage) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: jsdomInstance.window.localStorage,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: jsdomInstance.window.sessionStorage,
    configurable: true,
  });
}

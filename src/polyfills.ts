// Polyfills for Node.js modules in browser environment
// Required for @perawallet/connect and algosdk

import { Buffer } from 'buffer';
import process from 'process';

// Make Buffer available globally
if (typeof globalThis !== 'undefined') {
  globalThis.Buffer = Buffer;
  globalThis.process = process;
}

// For older browsers
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).process = process;
  (window as any).global = window;
}

export {}; 
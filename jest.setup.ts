import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = require('stream/web').ReadableStream;
}

// Polyfill crypto.randomUUID only if missing
if (!global.crypto) {
  // @ts-ignore
  global.crypto = {};
}

if (!global.crypto.randomUUID) {
  const { randomUUID } = require('crypto');
  global.crypto.randomUUID = randomUUID;
}

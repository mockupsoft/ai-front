import "@testing-library/jest-dom";
import { ReadableStream } from "stream/web";
import { TextDecoder, TextEncoder } from "util";

// jsdom ortamında stream / encoding polyfill (fetch mock testleri)
globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
if (typeof globalThis.ReadableStream === "undefined") {
  globalThis.ReadableStream =
    ReadableStream as unknown as typeof globalThis.ReadableStream;
}

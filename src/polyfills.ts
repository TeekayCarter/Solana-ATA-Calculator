import { Buffer } from "buffer";

if (typeof globalThis.Buffer === "undefined") {
  globalThis.Buffer = Buffer;
}

if (typeof (globalThis as { global?: unknown }).global === "undefined") {
  (globalThis as { global?: unknown }).global = globalThis;
}

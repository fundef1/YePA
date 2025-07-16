import * as zip from "@zip.js/zip.js";

let configured = false;

/**
 * Configures the @zip.js/zip.js library to use web workers for performance.
 * This prevents zipping/unzipping from blocking the main UI thread.
 * It ensures the configuration is applied only once.
 */
export function configureZipJs() {
  if (configured) {
    return;
  }
  try {
    zip.configure({
      useWebWorkers: true,
      // These paths are relative to the public directory
      workerScripts: {
        deflate: ["/workers/z-worker.js", "/workers/pako.deflate.js"],
        inflate: ["/workers/z-worker.js", "/workers/pako.inflate.js"],
      },
    });
    console.log("zip.js configured successfully with web workers.");
    configured = true;
  } catch (error) {
    console.error("Failed to configure zip.js with web workers. Zipping/unzipping may be slow or cause UI freezes.", error);
    // Fallback to non-worker implementation
    zip.configure({
      useWebWorkers: false,
    });
  }
}
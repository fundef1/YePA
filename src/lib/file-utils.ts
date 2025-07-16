/**
 * Reads the beginning of a blob as a string to allow for parsing metadata like XML encoding.
 * It reads as 'latin1' to treat bytes as individual characters, preventing corruption
 * before the correct encoding is determined.
 * @param blob The blob to read from.
 * @returns A promise that resolves with the beginning of the file content as a string.
 */
export const readBlobAsText = (blob: Blob): Promise<string> => {
  // Reading the first 1024 bytes is usually sufficient to find the XML declaration.
  const slice = blob.slice(0, 1024);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    // Read as a binary string to inspect for encoding without mangling characters.
    reader.readAsText(slice, "latin1");
  });
};

/**
 * Creates a TextDecoder based on the encoding specified in an XML string.
 * Defaults to 'utf-8' if no encoding is found or if the specified encoding is not supported.
 * @param xmlString A string containing the start of an XML file.
 * @returns A TextDecoder instance for the detected encoding.
 */
export const getTextDecoder = (xmlString: string): TextDecoder => {
  const match = xmlString.match(/<\?xml[^>]*encoding="([^"]+)"/i);
  const encoding = match ? match[1].toLowerCase() : "utf-8";

  try {
    // Validate if the encoding is supported by the browser.
    return new TextDecoder(encoding);
  } catch (e) {
    console.warn(
      `Unsupported encoding "${encoding}" found. Falling back to 'utf-8'.`
    );
    return new TextDecoder("utf-8");
  }
};
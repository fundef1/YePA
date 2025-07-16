import { ZipReader, BlobReader, BlobWriter } from "@zip.js/zip.js";

/**
 * Unzips a given file (expected to be an EPUB) and extracts its contents.
 * @param file The EPUB file to unzip.
 * @param appendLog A callback function to append messages to a log.
 * @param setProgress A callback function to update the progress (0-50%).
 * @returns A promise that resolves to an array of objects, each containing the filename and its Blob data.
 */
export const unzipFileContents = async (
  file: File,
  appendLog: (message: string) => void,
  setProgress: (progress: number) => void
): Promise<{ filename: string; data: Blob }[]> => {
  appendLog("Unzipping file...");
  const reader = new ZipReader(new BlobReader(file));
  const entries = await reader.getEntries();
  appendLog(`Found ${entries.length} entries.`);

  const extractedEntries: { filename: string; data: Blob }[] = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    appendLog(`Extracting: ${entry.filename}`);
    const data = await entry.getData(new BlobWriter());
    extractedEntries.push({ filename: entry.filename, data });
    setProgress(((i + 1) / entries.length) * 50); // Progress for unzipping (0-50%)
  }
  await reader.close();
  appendLog("Unzipping complete.");
  return extractedEntries;
};
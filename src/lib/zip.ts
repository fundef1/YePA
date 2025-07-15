import { BlobReader, BlobWriter, ZipWriter } from "@zip.js/zip.js";

/**
 * Zips an array of file entries into a new Blob (expected to be an EPUB).
 * @param entriesToZip An array of objects, each containing the filename and its Blob data.
 * @param appendLog A callback function to append messages to a log.
 * @param setProgress A callback function to update the progress (50-100%).
 * @returns A promise that resolves to the zipped Blob.
 */
export const zipFileContents = async (
  entriesToZip: { filename: string; data: Blob }[],
  appendLog: (message: string) => void,
  setProgress: (progress: number) => void
): Promise<Blob> => {
  appendLog("Zipping file...");
  const writer = new ZipWriter(new BlobWriter("application/zip"));

  for (let i = 0; i < entriesToZip.length; i++) {
    const entry = entriesToZip[i];
    appendLog(`Adding to zip: ${entry.filename}`);
    await writer.add(entry.filename, new BlobReader(entry.data));
    setProgress(50 + ((i + 1) / entriesToZip.length) * 50); // Progress for zipping (50-100%)
  }
  const blob = await writer.close();
  appendLog("Zipping complete.");
  return blob;
};
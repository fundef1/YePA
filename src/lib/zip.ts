import { BlobReader, BlobWriter, ZipWriter } from "@zip.js/zip.js";

/**
 * Zips an array of file entries into a new Blob (expected to be an EPUB).
 * Ensures 'mimetype' is the first entry and uncompressed, and preserves the order of other files.
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
  // Initialize ZipWriter with keepOrder: true
  const writer = new ZipWriter(new BlobWriter("application/zip"), { keepOrder: true });

  let mimetypeEntry: { filename: string; data: Blob } | undefined;
  const otherEntries: { filename: string; data: Blob }[] = [];

  // Separate mimetype from other entries
  for (const entry of entriesToZip) {
    if (entry.filename === "mimetype") {
      mimetypeEntry = entry;
    } else {
      otherEntries.push(entry);
    }
  }

  let processedCount = 0;
  const totalEntries = entriesToZip.length;

  // Add mimetype first, without compression
  if (mimetypeEntry) {
    appendLog(`Adding to zip: ${mimetypeEntry.filename} (uncompressed)`);
    await writer.add(mimetypeEntry.filename, new BlobReader(mimetypeEntry.data), { level: 0 });
    processedCount++;
    setProgress(50 + (processedCount / totalEntries) * 50); // Update progress
  }

  // Add all other entries
  for (const entry of otherEntries) {
    appendLog(`Adding to zip: ${entry.filename}`);
    await writer.add(entry.filename, new BlobReader(entry.data));
    processedCount++;
    setProgress(50 + (processedCount / totalEntries) * 50); // Update progress
  }

  const blob = await writer.close();
  appendLog("Zipping complete.");
  return blob;
};
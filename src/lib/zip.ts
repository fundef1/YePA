import { BlobReader, BlobWriter, ZipWriter } from "@zip.js/zip.js";

/**
 * Zips an array of file entries into a new Blob (expected to be an EPUB).
 * Ensures 'mimetype' is the first entry and uncompressed.
 * Sets compression level 0 for images (jpg, png, gif) and 8 for other files.
 * Preserves the order of files.
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
  const writer = new ZipWriter(new BlobWriter("application/zip"), { keepOrder: true });

  let mimetypeEntry: { filename: string; data: Blob } | undefined;
  const otherEntries: { filename: string; data: Blob }[] = [];

  // Define image extensions for no compression
  const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".gif"]);

  // Separate mimetype from other entries and categorize others
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

  // Add all other entries with appropriate compression
  for (const entry of otherEntries) {
    const fileExtension = entry.filename.toLowerCase().substring(entry.filename.lastIndexOf("."));
    const compressionLevel = imageExtensions.has(fileExtension) ? 0 : 8;
    
    appendLog(`Adding to zip: ${entry.filename} (compression level: ${compressionLevel})`);
    await writer.add(entry.filename, new BlobReader(entry.data), { level: compressionLevel });
    processedCount++;
    setProgress(50 + (processedCount / totalEntries) * 50); // Update progress
  }

  const blob = await writer.close();
  appendLog("Zipping complete.");
  return blob;
};
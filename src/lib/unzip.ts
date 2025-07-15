import { ZipReader, BlobReader, BlobWriter } from "@zip.js/zip.js";

/**
 * Unzips a given file (expected to be an EPUB) and extracts its contents.
 * It also handles cases where the EPUB contents are nested inside a single root directory.
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

  if (entries.length === 0) {
    await reader.close();
    return [];
  }

  // Detect and determine a common root folder path
  let rootPath = "";
  const firstEntryPath = entries[0].filename;
  const firstSlashIndex = firstEntryPath.indexOf('/');
  
  if (firstSlashIndex > -1) {
    const potentialRoot = firstEntryPath.substring(0, firstSlashIndex + 1);
    if (entries.every(entry => entry.filename.startsWith(potentialRoot))) {
      rootPath = potentialRoot;
      appendLog(`Detected common root folder: ${rootPath}. Stripping it from file paths.`);
    }
  }

  const extractedEntries: { filename: string; data: Blob }[] = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    
    // Strip the common root path if it exists
    const finalFilename = rootPath ? entry.filename.substring(rootPath.length) : entry.filename;

    // Skip directory entries which would now be empty
    if (!finalFilename) {
      setProgress(((i + 1) / entries.length) * 50);
      continue;
    }

    appendLog(`Extracting: ${entry.filename} as ${finalFilename}`);
    const data = await entry.getData(new BlobWriter());
    extractedEntries.push({ filename: finalFilename, data });
    setProgress(((i + 1) / entries.length) * 50); // Progress for unzipping (0-50%)
  }
  
  await reader.close();
  appendLog("Unzipping complete.");
  return extractedEntries;
};
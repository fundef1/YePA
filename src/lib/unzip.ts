import { ZipReader, BlobReader, BlobWriter } from "@zip.js/zip.js";

/**
 * Unzips a given file (expected to be an EPUB) and extracts its contents.
 * Corrects file paths by removing any leading directory that matches the uploaded file's name or its base name.
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
  // Prepare potential prefixes to strip
  const uploadedFileNameWithSlash = file.name + '/'; // e.g., "my_book.epub/"
  const uploadedFileNameWithoutExtWithSlash = file.name.replace(/\.epub$/, '') + '/'; // e.g., "my_book/"

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    let cleanFilename = entry.filename;

    // Remove leading directory if it matches the uploaded file's name or its base name
    if (cleanFilename.startsWith(uploadedFileNameWithSlash)) {
      cleanFilename = cleanFilename.substring(uploadedFileNameWithSlash.length);
    } else if (cleanFilename.startsWith(uploadedFileNameWithoutExtWithSlash)) {
      cleanFilename = cleanFilename.substring(uploadedFileNameWithoutExtWithSlash.length);
    }
    
    appendLog(`Extracting: ${entry.filename} -> ${cleanFilename}`);
    const data = await entry.getData(new BlobWriter());
    extractedEntries.push({ filename: cleanFilename, data });
    setProgress(((i + 1) / entries.length) * 50); // Progress for unzipping (0-50%)
  }
  await reader.close();
  appendLog("Unzipping complete.");
  return extractedEntries;
};
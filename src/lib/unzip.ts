import * as zip from "@zip.js/zip.js";

/**
 * Unzips an EPUB file and returns its file entries.
 * @param file The EPUB file to unzip.
 * @param appendLog A callback function to append messages to a log.
 * @param setProgress A callback function to update the progress.
 * @returns A promise that resolves to an array of file entries.
 */
export const unzipEpub = async (
  file: File,
  appendLog: (message: string) => void,
  setProgress: (progress: number) => void
): Promise<{ filename: string; data: Blob }[]> => {
  appendLog("Unzipping EPUB...");
  const reader = new zip.BlobReader(file);
  const zipReader = new zip.ZipReader(reader);

  zipReader.addEventListener("progress", (event) => {
    if (event.total) {
      setProgress((event.loaded / event.total) * 100);
    }
  });

  try {
    const entries = await zipReader.getEntries();
    const fileContents: { filename: string; data: Blob }[] = [];

    for (const entry of entries) {
      if (entry.getData && !entry.directory) {
        const mimeType = getMimeType(entry.filename);
        const data = await entry.getData(new zip.BlobWriter(mimeType));
        fileContents.push({ filename: entry.filename, data });
      }
    }

    await zipReader.close();
    appendLog("Unzipping complete.");
    return fileContents;
  } catch (error) {
    appendLog(`Error during unzipping: ${error}`);
    throw error;
  }
};

/**
 * Determines the MIME type based on the file extension.
 * @param filename The name of the file.
 * @returns The corresponding MIME type or a default.
 */
const getMimeType = (filename: string): string => {
  if (filename.endsWith(".xhtml") || filename.endsWith(".html"))
    return "application/xhtml+xml";
  if (filename.endsWith(".css")) return "text/css";
  if (filename.endsWith(".xml")) return "application/xml";
  if (filename.endsWith(".ncx")) return "application/x-dtbncx+xml";
  if (filename.endsWith(".opf")) return "application/oebps-package+xml";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "image/jpeg";
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".gif")) return "image/gif";
  if (filename.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
};
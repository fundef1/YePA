import * as zip from "@zip.js/zip.js";
import { EpubFile } from "@/types/epub";

/**
 * Repacks files into an EPUB (ZIP) archive.
 * @param files The array of files to include in the EPUB.
 * @param appendLog A callback function to append messages to a log.
 * @param setProgress A callback function to update the progress (0-100).
 * @returns A promise that resolves to the repacked EPUB as a Blob.
 */
export const repackEpub = async (
  files: EpubFile[],
  appendLog: (message: string) => void,
  setProgress: (progress: number) => void
): Promise<Blob> => {
  appendLog("Starting to repack EPUB...");
  setProgress(0);

  const blobWriter = new zip.BlobWriter("application/epub+zip");
  const zipWriter = new zip.ZipWriter(blobWriter);

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const blobReader = new zip.BlobReader(file.data);

      await zipWriter.add(file.filename, blobReader);

      const progress = ((i + 1) / files.length) * 100;
      setProgress(progress);
    }

    appendLog("Finalizing EPUB archive...");
    const epubBlob = await zipWriter.close();

    setProgress(100);
    appendLog("Repacking complete.");

    return epubBlob;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    appendLog(`Error during repacking: ${errorMessage}`);
    throw error;
  }
};
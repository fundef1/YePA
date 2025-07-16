import * as zip from "@zip.js/zip.js";

export const unzipFileContents = async (
  file: File,
  appendLog: (message: string) => void,
  setProgress: (progress: number) => void
): Promise<{ filename: string; data: Blob }[]> => {
  appendLog("Creating zip reader...");
  const zipReader = new zip.ZipReader(new zip.BlobReader(file));

  appendLog("Getting entries...");
  const entries = await zipReader.getEntries({
    onprogress: (progress, total) => {
      setProgress(Math.round((progress / total) * 100));
    },
  });
  appendLog(`Found ${entries.length} entries.`);

  const contents: { filename: string; data: Blob }[] = [];
  if (entries.length > 0) {
    for (const entry of entries) {
      if (entry.getData && !entry.directory) {
        const data = await entry.getData(new zip.BlobWriter());
        contents.push({ filename: entry.filename, data });
        appendLog(`Unzipped: ${entry.filename}`);
      }
    }
  }

  await zipReader.close();
  appendLog("Zip reader closed.");

  return contents;
};
import * as zip from "@zip.js/zip.js";

export const zipFileContents = async (
  contents: { filename: string; data: Blob }[],
  appendLog: (message: string) => void,
  setProgress: (progress: number) => void
): Promise<Blob> => {
  appendLog("Creating zip writer...");
  const zipWriter = new zip.ZipWriter(new zip.BlobWriter("application/epub+zip"));

  appendLog(`Adding ${contents.length} files to the zip...`);
  for (let i = 0; i < contents.length; i++) {
    const file = contents[i];
    await zipWriter.add(file.filename, new zip.BlobReader(file.data));
    const progress = Math.round(((i + 1) / contents.length) * 100);
    setProgress(progress);
    if (i % 100 === 0 || i === contents.length - 1) {
      appendLog(`...added ${i + 1}/${contents.length} files`);
    }
  }

  appendLog("Finalizing zip file...");
  const epubBlob = await zipWriter.close();
  appendLog("Zip file created successfully.");
  return epubBlob;
};
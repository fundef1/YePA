import Vips from "wasm-vips";

let vips: any;

const initializeVips = async (
  appendLog: (message: string) => void,
  setProgress: (progress: number) => void
) => {
  if (vips) {
    return;
  }
  appendLog("Initializing image processing library (VIPS)...");
  setProgress(0);
  vips = await Vips();
  appendLog("VIPS initialized.");
};

const getImageEntries = (entries: { filename: string; data: Blob }[]) => {
  const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);
  return entries.filter(({ filename }) => {
    const extension = filename.slice(filename.lastIndexOf(".")).toLowerCase();
    return imageExtensions.has(extension);
  });
};

export const scaleImages = async (
  entries: { filename: string; data: Blob }[],
  appendLog: (message: string) => void,
  setProgress: (progress: number) => void,
  maxWidth: number,
  maxHeight: number
): Promise<{ filename: string; data: Blob }[]> => {
  await initializeVips(appendLog, setProgress);
  appendLog(`Scaling images to max ${maxWidth}x${maxHeight}...`);

  const imageEntries = getImageEntries(entries);
  if (imageEntries.length === 0) {
    appendLog("No images found to scale.");
    return entries;
  }

  const processedEntries = [...entries];
  let processedCount = 0;

  for (const imageEntry of imageEntries) {
    appendLog(`Scaling ${imageEntry.filename}...`);
    const image = vips.Image.newFromBuffer(await imageEntry.data.arrayBuffer());

    const scale = Math.min(
      maxWidth / image.width,
      maxHeight / image.height,
      1
    );
    const scaledImage = image.resize(scale);

    const newBuffer = scaledImage.writeToBuffer(
      `.${imageEntry.filename.split(".").pop()}`
    );
    const newBlob = new Blob([newBuffer]);

    const index = processedEntries.findIndex(
      (e) => e.filename === imageEntry.filename
    );
    processedEntries[index] = { ...imageEntry, data: newBlob };

    processedCount++;
    setProgress((processedCount / imageEntries.length) * 100);
  }

  appendLog("Image scaling complete.");
  return processedEntries;
};

export const grayscaleImages = async (
  entries: { filename: string; data: Blob }[],
  appendLog: (message: string) => void,
  setProgress: (progress: number) => void,
  levels: number
): Promise<{ filename:string; data: Blob }[]> => {
  await initializeVips(appendLog, setProgress);
  appendLog(`Converting images to ${levels}-level grayscale...`);

  const imageEntries = getImageEntries(entries);
  if (imageEntries.length === 0) {
    appendLog("No images found to grayscale.");
    return entries;
  }

  const processedEntries = [...entries];
  let processedCount = 0;

  for (const imageEntry of imageEntries) {
    appendLog(`Grayscaling ${imageEntry.filename}...`);
    const image = vips.Image.newFromBuffer(await imageEntry.data.arrayBuffer());

    let grayImage = image.colourspace("b-w");

    if (levels > 0 && levels < 256) {
      const factor = 256 / levels;
      grayImage = grayImage.divide(factor).floor().multiply(factor);
    }

    const newBuffer = grayImage.writeToBuffer(
      `.${imageEntry.filename.split(".").pop()}`
    );
    const newBlob = new Blob([newBuffer]);

    const index = processedEntries.findIndex(
      (e) => e.filename === imageEntry.filename
    );
    processedEntries[index] = { ...imageEntry, data: newBlob };

    processedCount++;
    setProgress((processedCount / imageEntries.length) * 100);
  }

  appendLog("Grayscale conversion complete.");
  return processedEntries;
};

export { initializeVips };
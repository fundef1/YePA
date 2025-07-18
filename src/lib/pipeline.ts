const IMAGE_MIN_SIZE_BYTES = 50 * 1024; // 50KB
const RESIZABLE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

interface ImageEntry {
  filename: string;
  data: Blob;
}

/**
 * Resizes an image blob if its dimensions exceed the max values.
 * @returns A promise that resolves to the resized blob, or the original blob if no resize was needed.
 */
const resizeImageBlob = (
  blob: Blob,
  filename: string,
  maxWidth: number,
  maxHeight: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.src = url;

    img.onload = () => {
      URL.revokeObjectURL(url);

      const { width: originalWidth, height: originalHeight } = img;

      if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
        resolve(blob); // No resize needed as it's already within bounds
        return;
      }

      let newWidth = originalWidth;
      let newHeight = originalHeight;

      if (originalWidth > maxWidth) {
        newWidth = maxWidth;
        newHeight = (originalHeight * maxWidth) / originalWidth;
      }

      if (newHeight > maxHeight) {
        const oldWidth = newWidth;
        newHeight = maxHeight;
        newWidth = (oldWidth * maxHeight) / newHeight;
      }

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Could not get canvas context"));
      }

      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      canvas.toBlob(
        (resizedBlob) => {
          if (resizedBlob) {
            resolve(resizedBlob);
          } else {
            reject(new Error(`Failed to create blob for ${filename}`));
          }
        },
        blob.type,
        0.9 // Quality setting for JPEG/WebP
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${filename}`));
    };
  });
};

/**
 * Iterates through file entries and resizes images that meet the criteria in parallel.
 * @returns A promise that resolves to the new array of entries with resized images.
 */
export const resizeImages = async (
  entries: ImageEntry[],
  maxWidth: number,
  maxHeight: number,
  appendLog: (message: string) => void,
  setProgress: (progress: number) => void
): Promise<ImageEntry[]> => {
  if (maxWidth === 0 || maxHeight === 0) {
    appendLog("Image resizing skipped (pass-through).");
    setProgress(100);
    return entries;
  }

  appendLog(`Resizing images to fit within ${maxWidth}x${maxHeight}...`);
  
  const imageEntriesToProcess = entries.filter(entry => {
    const fileExtension = entry.filename.toLowerCase().substring(entry.filename.lastIndexOf("."));
    return RESIZABLE_EXTENSIONS.has(fileExtension) && entry.data.size > IMAGE_MIN_SIZE_BYTES;
  });

  if (imageEntriesToProcess.length === 0) {
    appendLog("No images to resize.");
    setProgress(100);
    return entries;
  }

  const otherEntries = entries.filter(entry => !imageEntriesToProcess.includes(entry));
  
  let processedCount = 0;
  const totalToProcess = imageEntriesToProcess.length;
  const updateProgress = () => {
    processedCount++;
    setProgress((processedCount / totalToProcess) * 100);
  };

  const processingPromises = imageEntriesToProcess.map(async (entry) => {
    try {
      appendLog(`Resizing candidate: ${entry.filename} (${(entry.data.size / 1024).toFixed(1)} KB)`);
      const resizedBlob = await resizeImageBlob(entry.data, entry.filename, maxWidth, maxHeight);
      if (resizedBlob.size < entry.data.size) {
        appendLog(` -> Resized to ${(resizedBlob.size / 1024).toFixed(1)} KB`);
        updateProgress();
        return { ...entry, data: resizedBlob };
      } else {
        appendLog(` -> Skipped (resized version not smaller)`);
        updateProgress();
        return entry;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      appendLog(`Error resizing ${entry.filename}: ${msg}. Keeping original.`);
      updateProgress();
      return entry;
    }
  });

  const resizedImages = await Promise.all(processingPromises);

  appendLog("Image resizing complete.");
  return [...resizedImages, ...otherEntries];
};

/**
 * Converts an image blob to a specified number of grayscale levels.
 * @returns A promise that resolves to the grayscaled blob.
 */
const grayscaleImageBlob = (
  blob: Blob,
  filename: string,
  levels: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.src = url;

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        return reject(new Error("Could not get canvas context for grayscaling"));
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const gray = Math.round(avg * (levels - 1) / 255) * (255 / (levels - 1));
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob(
        (grayscaledBlob) => {
          if (grayscaledBlob) {
            resolve(grayscaledBlob);
          } else {
            reject(new Error(`Failed to create grayscaled blob for ${filename}`));
          }
        },
        blob.type,
        0.9
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image for grayscaling: ${filename}`));
    };
  });
};

/**
 * Iterates through file entries and converts images to grayscale in parallel.
 * @returns A promise that resolves to the new array of entries with grayscaled images.
 */
export const grayscaleImages = async (
  entries: ImageEntry[],
  levels: number,
  appendLog: (message: string) => void,
  setProgress: (progress: number) => void
): Promise<ImageEntry[]> => {
  if (!levels || levels <= 1) {
    appendLog("Grayscale conversion skipped (pass-through).");
    setProgress(100);
    return entries;
  }

  appendLog(`Converting images to ${levels} levels of gray...`);
  
  const imageEntriesToProcess = entries.filter(entry => {
    const fileExtension = entry.filename.toLowerCase().substring(entry.filename.lastIndexOf("."));
    return RESIZABLE_EXTENSIONS.has(fileExtension);
  });

  if (imageEntriesToProcess.length === 0) {
    appendLog("No images to convert to grayscale.");
    setProgress(100);
    return entries;
  }

  const otherEntries = entries.filter(entry => !imageEntriesToProcess.includes(entry));

  let processedCount = 0;
  const totalToProcess = imageEntriesToProcess.length;
  const updateProgress = () => {
    processedCount++;
    setProgress((processedCount / totalToProcess) * 100);
  };

  const processingPromises = imageEntriesToProcess.map(async (entry) => {
    try {
      appendLog(`Grayscaling candidate: ${entry.filename}`);
      const grayscaledBlob = await grayscaleImageBlob(entry.data, entry.filename, levels);
      appendLog(` -> Grayscaled successfully.`);
      updateProgress();
      return { ...entry, data: grayscaledBlob };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      appendLog(`Error grayscaling ${entry.filename}: ${msg}. Keeping original.`);
      updateProgress();
      return entry;
    }
  });

  const grayscaledImages = await Promise.all(processingPromises);

  appendLog("Grayscale conversion complete.");
  return [...grayscaledImages, ...otherEntries];
};
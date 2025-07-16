const IMAGE_MIN_SIZE_BYTES = 50 * 1024; // 50KB
const RESIZABLE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

interface ResizeImageEntry {
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
 * Iterates through file entries and resizes images that meet the criteria.
 * @returns A promise that resolves to the new array of entries with resized images.
 */
export const resizeImages = async (
  entries: ResizeImageEntry[],
  maxWidth: number,
  maxHeight: number,
  appendLog: (message: string) => void,
  setProgress: (progress: number) => void
): Promise<ResizeImageEntry[]> => {
  if (maxWidth === 0 || maxHeight === 0) {
    appendLog("Image resizing skipped (pass-through).");
    setProgress(100);
    return entries;
  }

  appendLog(`Resizing images to fit within ${maxWidth}x${maxHeight}...`);
  const newEntries: ResizeImageEntry[] = [];
  const totalEntries = entries.length;
  let processedCount = 0;

  for (const entry of entries) {
    const fileExtension = entry.filename.toLowerCase().substring(entry.filename.lastIndexOf("."));

    if (RESIZABLE_EXTENSIONS.has(fileExtension) && entry.data.size > IMAGE_MIN_SIZE_BYTES) {
      try {
        appendLog(`Resizing candidate: ${entry.filename} (${(entry.data.size / 1024).toFixed(1)} KB)`);
        const resizedBlob = await resizeImageBlob(entry.data, entry.filename, maxWidth, maxHeight);
        if (resizedBlob.size < entry.data.size) {
          appendLog(` -> Resized to ${(resizedBlob.size / 1024).toFixed(1)} KB`);
          newEntries.push({ ...entry, data: resizedBlob });
        } else {
          appendLog(` -> Skipped (resized version not smaller)`);
          newEntries.push(entry);
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        appendLog(`Error resizing ${entry.filename}: ${msg}. Keeping original.`);
        newEntries.push(entry);
      }
    } else {
      newEntries.push(entry);
    }
    processedCount++;
    setProgress((processedCount / totalEntries) * 100);
  }

  appendLog("Image resizing complete.");
  return newEntries;
};
/**
 * Creates an Image element from a Blob.
 * @param imageBlob The image blob.
 * @returns A promise that resolves to an HTMLImageElement.
 */
const createImageFromBlob = (imageBlob: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(imageBlob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };
    image.onerror = (err) => {
      URL.revokeObjectURL(imageUrl);
      reject(err);
    };
    image.src = imageUrl;
  });
};

/**
 * Resizes an image if it exceeds maxWidth or maxHeight, maintaining aspect ratio.
 * @param image The source image element.
 * @param maxWidth The maximum width.
 * @param maxHeight The maximum height.
 * @returns An object with the new width and height.
 */
const getResizedDimensions = (image: HTMLImageElement, maxWidth: number, maxHeight: number) => {
  let { width, height } = image;
  const ratio = width / height;

  if (width > maxWidth) {
    width = maxWidth;
    height = Math.round(width / ratio);
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = Math.round(height * ratio);
  }

  return { width, height };
};

/**
 * Applies a grayscale filter to the canvas context.
 * @param ctx The canvas 2D rendering context.
 * @param width The width of the canvas.
 * @param height The height of the canvas.
 * @param numLevels The number of grayscale levels.
 */
const applyGrayscale = (ctx: CanvasRenderingContext2D, width: number, height: number, numLevels: number) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const factor = 255 / (numLevels - 1);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Using luminosity method for grayscale conversion
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const level = Math.round(gray / factor) * factor;
    data[i] = data[i + 1] = data[i + 2] = level;
  }
  ctx.putImageData(imageData, 0, 0);
};

/**
 * Processes an image blob by resizing and/or converting to grayscale.
 *
 * @param imageBlob The input image blob.
 * @param options An object with processing options.
 * @param options.resize Optional resize parameters { maxWidth, maxHeight }.
 * @param options.gray Optional grayscale parameter { numLevels }.
 * @returns A promise that resolves to the processed image blob.
 */
export const processImage = async (
  imageBlob: Blob,
  options: {
    resize?: { maxWidth: number; maxHeight: number };
    gray?: { numLevels: number };
  }
): Promise<Blob> => {
  const image = await createImageFromBlob(imageBlob);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Determine final dimensions
  const { width, height } = options.resize
    ? getResizedDimensions(image, options.resize.maxWidth, options.resize.maxHeight)
    : { width: image.width, height: image.height };

  canvas.width = width;
  canvas.height = height;

  // Draw (and resize) the image
  ctx.drawImage(image, 0, 0, width, height);

  // Apply grayscale if requested
  if (options.gray && options.gray.numLevels > 1) {
    applyGrayscale(ctx, width, height, options.gray.numLevels);
  }

  // Get the result as a blob
  return new Promise((resolve, reject) => {
    // Use original image type if it's supported, otherwise default to png.
    const type = ['image/jpeg', 'image/png', 'image/gif'].includes(imageBlob.type) ? imageBlob.type : 'image/png';
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob conversion failed'));
        }
      },
      type,
      0.9 // quality for jpeg
    );
  });
};
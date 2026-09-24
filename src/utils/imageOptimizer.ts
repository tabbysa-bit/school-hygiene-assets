/**
 * Client-side image optimization helper.
 * Converts uploaded images to web-optimized WebP or compressed JPEG/PNG
 * ensuring clear Korean text readability for kitchen staff.
 */
export async function optimizeImageForWeb(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.88
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Scale down proportionally if larger than maximum bounds
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        // Fallback to original file
        resolve({ blob: file, width: img.width, height: img.height });
        return;
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Try webp first, fallback to jpeg/png if browser lacks webp canvas export
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, width, height });
          } else {
            // Fallback to jpeg
            canvas.toBlob(
              (fallbackBlob) => {
                if (fallbackBlob) {
                  resolve({ blob: fallbackBlob, width, height });
                } else {
                  resolve({ blob: file, width, height });
                }
              },
              'image/jpeg',
              quality
            );
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}

/**
 * Converts a file to a Base64 Data URL for instant resilient preview and fallback.
 */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

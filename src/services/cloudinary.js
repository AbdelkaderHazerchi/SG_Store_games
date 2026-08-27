const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function uploadUrl() {
  return `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
}

/**
 * Upload an image to Cloudinary via unsigned preset.
 * Returns { url, publicId, width, height }.
 */
export function uploadImage(file, { folder = 'sg-store/games', onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl());

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
        });
      } else {
        reject(new Error('Image upload failed. Check your Cloudinary configuration.'));
      }
    });
    xhr.addEventListener('error', () => reject(new Error('Network error during upload.')));

    xhr.send(formData);
  });
}

/**
 * Client-side square crop + resize (used for avatars at 512x512)
 * so uploads stay small and consistent regardless of source image.
 */
export async function resizeToSquare(file, size = 512) {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(new File([blob], `${Date.now()}-avatar.png`, { type: 'image/png' })) : reject(new Error('Resize failed'))),
      'image/png'
    );
  });
}

export async function uploadAvatar(file) {
  const resized = await resizeToSquare(file, 512);
  const result = await uploadImage(resized, { folder: 'sg-store/avatars' });
  return result.url;
}

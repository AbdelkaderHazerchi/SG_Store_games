import { useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { uploadImage } from '../../services/cloudinary';
import Spinner from './Spinner';

export default function ImageUploader({
  label,
  images = [],
  onChange,
  max = 1,
  aspect = 'aspect-video',
  folder = 'sg-store/games',
  error,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    const slotsLeft = max - images.length;
    const toUpload = files.slice(0, Math.max(slotsLeft, 0));
    if (!toUpload.length) {
      setUploadError(`Maximum of ${max} image${max > 1 ? 's' : ''}.`);
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const uploaded = [];
      for (const file of toUpload) {
        const result = await uploadImage(file, {
          folder,
          onProgress: (pct) => setProgress(pct),
        });
        uploaded.push(result.url);
      }
      onChange(max === 1 ? uploaded[0] : [...images, ...uploaded]);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  function removeImage(index) {
    if (max === 1) onChange('');
    else onChange(images.filter((_, i) => i !== index));
  }

  function openPicker() {
    inputRef.current?.click();
  }

  const list = max === 1 ? (images ? [images] : []) : images;

  return (
    <div>
      {label && <p className="mb-1.5 text-sm font-medium text-slate-300">{label}</p>}
      <div className={`grid gap-3 ${max === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {list.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className={`group relative overflow-hidden rounded-lg ring-1 ring-slate-700 ${aspect}`}
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute right-2 top-2 rounded-md bg-black/70 p-1.5 text-red-400 opacity-0 transition-opacity hover:bg-red-900/70 group-hover:opacity-100"
              aria-label="Remove image"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {list.length < max && (
          <button
            type="button"
            onClick={openPicker}
            disabled={uploading}
            className={`${aspect} flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-700 bg-slate-900/50 text-slate-400 transition-colors hover:border-primary hover:text-primary-light ${
              uploading ? 'opacity-60' : ''
            }`}
          >
            {uploading ? (
              <>
                <Spinner size="h-6 w-6" />
                <span className="text-xs">{progress}%</span>
              </>
            ) : (
              <>
                <ImagePlus className="h-7 w-7" />
                <span className="text-xs">Add image</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={max > 1}
        hidden
        onChange={handleFiles}
      />

      {(error || uploadError) && (
        <p className="mt-1.5 text-xs text-red-400">{error || uploadError}</p>
      )}
      {max > 1 && !error && (
        <p className="mt-1.5 text-xs text-slate-500">
          Up to {max} images ({list.length}/{max})
        </p>
      )}
    </div>
  );
}

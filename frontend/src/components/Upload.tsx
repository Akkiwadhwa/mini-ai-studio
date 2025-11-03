import React, { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  onChange: (file: File | null) => void;
};

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MAX_SIZE = 10 * 1024 * 1024;

export default function Upload({ onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const previewRef = useRef<string | null>(null);

  const resetPreview = useCallback(() => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setPreview(null);
    onChange(null);
  }, [onChange]);

  const readFile = useCallback(
    (file: File | null) => {
      setError(null);
      if (!file) {
        resetPreview();
        return;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Only JPEG and PNG files are supported.');
        resetPreview();
        return;
      }
      if (file.size > MAX_SIZE) {
        setError('Please choose an image under 10MB.');
        resetPreview();
        return;
      }
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
      const url = URL.createObjectURL(file);
      setPreview(url);
      previewRef.current = url;
      onChange(file);
    },
    [onChange, resetPreview]
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    readFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files.item(0);
    readFile(file ?? null);
  };

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="section-title">Image Upload</span>
        <span className="text-xs font-medium text-slate-400">JPEG or PNG - Max 10MB</span>
      </div>
      <div
        onDragOver={event => {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'copy';
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`group relative flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-6 text-center transition ${
          dragActive ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/15 bg-white/5 hover:border-indigo-300/80'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleChange}
          className="sr-only"
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-indigo-300/50 bg-indigo-500/10 text-indigo-200">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M10 3.333v13.334M3.333 10h13.334"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">
            Drag & drop an image
            <span className="mx-2 text-slate-500">or</span>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-indigo-300 underline decoration-dotted underline-offset-4 transition hover:text-indigo-200"
            >
              browse
            </button>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            We'll use your image as the base for the AI styling pass.
          </p>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-rose-300">
          {error}
        </p>
      )}
      {preview && (
        <figure className="glass-panel overflow-hidden rounded-3xl">
          <img src={preview} alt="Selected upload preview" className="h-64 w-full object-cover" />
        </figure>
      )}
    </section>
  );
}

import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, X, AlertTriangle } from 'lucide-react';
import { uploadImage, ImageBucket } from '../lib/supabaseStorage';

/**
 * Upload control for business logo / cover images (Supabase Storage).
 * Value is a public URL string ('' = none) — callers persist it through the
 * same create/update business flow as any other field.
 */
interface ImageUploadFieldProps {
  label: string;
  hint?: string;
  bucket: ImageBucket;
  nameHint: string;
  value: string;
  onChange: (url: string) => void;
  isDarkMode: boolean;
  previewClassName?: string; // e.g. "w-16 h-16 rounded-xl" (logo) or "h-28 w-full" (cover)
  disabled?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  hint,
  bucket,
  nameHint,
  value,
  onChange,
  isDarkMode,
  previewClassName = 'w-20 h-20 rounded-2xl',
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    setUploading(true);
    const result = await uploadImage(bucket, file, nameHint);
    setUploading(false);
    if (result.error || !result.data) {
      setError(result.error || 'Could not upload the image. Please try again.');
      return;
    }
    onChange(result.data.url);
  };

  const inputCls = isDarkMode
    ? 'bg-slate-950 border-slate-800 text-white'
    : 'bg-slate-50 border-slate-300 text-slate-900';

  return (
    <div className="space-y-1.5">
      <label className={`text-xs font-bold uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
        {label}
      </label>

      <div className={`flex items-center gap-3 p-3 rounded-2xl border ${inputCls}`}>
        {/* Preview / empty state */}
        {value ? (
          <div className="relative shrink-0">
            <img
              src={value}
              alt={`${label} preview`}
              className={`object-cover border ${previewClassName} ${
                isDarkMode ? 'border-slate-700' : 'border-slate-200'
              }`}
            />
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={disabled || uploading}
              title="Remove image"
              className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-500 text-white border border-rose-300/50 shadow hover:bg-rose-400 transition cursor-pointer disabled:opacity-50"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div
            className={`flex items-center justify-center bg-gradient-to-br from-slate-700 via-slate-800 to-emerald-950 ${previewClassName}`}
          >
            <ImagePlus className="w-5 h-5 text-emerald-400" />
          </div>
        )}

        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
              isDarkMode
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            <span>{uploading ? 'Uploading…' : value ? 'Replace Image' : 'Upload Image'}</span>
          </button>
          <p className={`text-[10px] leading-snug ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {hint || 'JPG, PNG, WEBP or GIF · max 5 MB'}
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = ''; // allow re-selecting the same file
        }}
      />

      {error && (
        <p className="text-[11px] text-rose-400 font-bold flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

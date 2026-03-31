'use client';

import React, { useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface UploadsPanelProps {
  onAddImage: (url: string) => void;
}

export default function UploadsPanel({ onAddImage }: UploadsPanelProps) {
  const { uploadedImages, addUploadedImage, removeUploadedImage } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        addUploadedImage(dataUrl);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div
        className="px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          Uploads
        </h2>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Add images to your canvas
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-2 px-3 py-5 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200"
          style={{
            borderColor: isDragOver ? 'var(--accent)' : 'var(--border)',
            background: isDragOver ? 'rgba(108, 92, 231, 0.08)' : 'transparent',
          }}
        >
          <Upload size={22} style={{ color: isDragOver ? 'var(--accent)' : 'var(--text-muted)' }} />
          <span className="text-[10px] font-medium text-center" style={{ color: 'var(--text-muted)' }}>
            Drag & drop images here
          </span>
          <span className="text-[9px]" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
            PNG, JPG, SVG
          </span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
          className="hidden"
        />

        {/* Image Grid */}
        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {uploadedImages.map((img, idx) => (
              <div key={idx} className="relative group">
                <button
                  onClick={() => onAddImage(img)}
                  className="w-full aspect-square rounded-xl border overflow-hidden transition-all duration-200 hover:scale-[1.03] hover:border-[var(--accent)]"
                  style={{
                    borderColor: 'var(--border)',
                    background: 'var(--bg-tertiary)',
                  }}
                  title="Click to add to canvas"
                >
                  <img
                    src={img}
                    alt={`Upload ${idx + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeUploadedImage(idx);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(255, 107, 107, 0.9)' }}
                  title="Remove"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {uploadedImages.length === 0 && (
          <div className="flex flex-col items-center gap-2 mt-4">
            <ImageIcon size={32} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
            <p className="text-[11px] text-center" style={{ color: 'var(--text-muted)' }}>
              No images uploaded yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

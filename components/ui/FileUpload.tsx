'use client';

import React, { useCallback } from 'react';
import { Card } from './Card';
import { categoryColors, type CategoryColor } from '@/config/ui';

interface FileUploadProps {
  label: string;
  description?: string;
  accept: string;
  category?: CategoryColor;
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export function FileUpload({
  label,
  description,
  accept,
  category = 'primary',
  onFileSelect,
  selectedFile,
}: FileUploadProps) {
  const colors = categoryColors[category];

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <Card category={category}>
      <div className="flex flex-col items-center">
        <div
          className={`w-16 h-16 rounded-full ${colors.background} flex items-center justify-center mb-4`}
        >
          <span className={`text-3xl ${colors.icon}`}>📄</span>
        </div>
        <h3 className={`text-xl font-bold mb-2 ${colors.text}`}>{label}</h3>
        {description && (
          <p className="text-sm text-gray-500 mb-4 text-center whitespace-pre-wrap">
            {description}
          </p>
        )}
        <div
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`file-input-${label}`}
          />
          <label
            htmlFor={`file-input-${label}`}
            className="cursor-pointer block"
          >
            {selectedFile ? (
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  ファイルをドラッグ&ドロップ
                </p>
                <p className="text-sm text-gray-500">または</p>
                <p className="text-sm text-blue-600 font-semibold mt-2">
                  クリックしてファイルを選択
                </p>
              </div>
            )}
          </label>
        </div>
      </div>
    </Card>
  );
}

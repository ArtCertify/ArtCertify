import React from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  files: File[];
  onFileUpload: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  label?: string;
  description?: string;
  className?: string;
  id: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFileUpload,
  multiple = true,
  accept,
  label = "Carica File",
  description = "Trascina qui i file o clicca per selezionare",
  className = "",
  id
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    onFileUpload(selectedFiles);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-white mb-3">
          {label}
        </label>
      <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors">
        <CloudArrowUpIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-400 mb-2">{description}</p>
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id={id}
        />
        <label
          htmlFor={id}
          className="cursor-pointer text-blue-400 hover:text-blue-300 underline"
        >
          Seleziona file
        </label>
      </div>

      {/* Associated Files */}
      {files.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-white mb-3">
            File associati
          </label>
        <div className="space-y-2">
          {files.map((file, index) => (
              <div key={index} className="flex items-center gap-2 text-white">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                <span>{file.name}</span>
              </div>
            ))}
            </div>
        </div>
      )}
    </div>
  );
};
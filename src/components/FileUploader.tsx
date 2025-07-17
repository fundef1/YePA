import React, { useState, useCallback } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { Button } from './ui/button';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, disabled }) => {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.name.endsWith('.epub')) {
        setFile(selectedFile);
        onFileSelect(selectedFile);
      } else {
        // In a real app, you'd use a toast notification here
        alert("Invalid file type. Please upload a .epub file.");
        onFileSelect(null);
      }
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/epub+zip': ['.epub'] },
    multiple: false,
    disabled,
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    onFileSelect(null);
  };

  return (
    <div
      {...getRootProps()}
      className={`p-8 border-2 border-dashed rounded-lg text-center transition-colors flex items-center justify-center min-h-[220px]
        ${isDragActive ? 'border-primary bg-blue-50 dark:bg-primary/10' : 'border-gray-300 dark:border-slate-700'}
        ${disabled ? 'cursor-not-allowed bg-gray-100 dark:bg-slate-800' : 'cursor-pointer hover:border-primary'}`}
    >
      <input {...getInputProps()} />
      
      {file ? (
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex items-center gap-4 text-left min-w-0">
            <FileIcon className="w-12 h-12 text-primary flex-shrink-0" />
            <div className="overflow-hidden">
              <p className="font-medium text-gray-800 dark:text-gray-200 truncate" title={file.name}>{file.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={removeFile} disabled={disabled}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400">
          <UploadCloud className="w-12 h-12 mb-2" />
          <p className="font-semibold">Drag & drop your .epub file here</p>
          <p className="text-sm">or</p>
          <Button type="button" variant="outline" disabled={disabled}>Click to browse</Button>
        </div>
      )}
    </div>
  );
};
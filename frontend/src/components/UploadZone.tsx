import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, RefreshCw } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  error?: string | null;
  className?: string;
}

const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelect,
  isUploading,
  error = null,
  className = '',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    const lastDot = file.name.lastIndexOf('.');
    const fileExtension = lastDot !== -1 ? file.name.substring(lastDot).toLowerCase() : '';
    const acceptedExtensions = ['.pdf', '.docx'];

    if (!acceptedExtensions.includes(fileExtension)) {
      alert("Unsupported file format. Please upload a valid PDF or DOCX resume.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds limit of 5MB");
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`glass-panel cursor-pointer rounded-2xl p-8 border-2 border-dashed flex flex-col items-center justify-center text-center transition-all duration-300 ${
          dragActive ? 'border-brand-500 bg-brand-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/30'
        } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx"
          onChange={handleChange}
        />

        {isUploading ? (
          <div className="flex flex-col items-center py-6">
            <RefreshCw className="w-10 h-10 text-brand-400 animate-spin mb-4" />
            <h4 className="font-bold text-slate-200 text-base">Parsing Resume Content...</h4>
            <p className="text-xs text-slate-500 mt-1.5 max-w-[280px]">
              Extracting text and structural keywords using AI parsing engine. This will take a few seconds.
            </p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center py-4">
            <div className="bg-brand-500/10 p-3.5 rounded-2xl border border-brand-500/20 text-brand-400 mb-4 animate-bounce">
              <FileText className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-200 text-sm truncate max-w-[250px]">
              {selectedFile.name}
            </h4>
            <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
            <span className="mt-4 text-xs font-semibold text-brand-400 hover:text-brand-300 underline">
              Choose a different file
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6">
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-slate-400 mb-4 hover:text-slate-300">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-200 text-sm tracking-wide">
              Drag & drop your resume here, or <span className="text-brand-400 font-bold hover:underline">browse</span>
            </h4>
            <p className="text-xs text-slate-500 mt-2">
              Supports PDF or DOCX format (Max 5MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 flex items-start gap-2.5 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default UploadZone;

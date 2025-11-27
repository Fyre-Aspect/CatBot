import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Loader2, File } from 'lucide-react';
import { processFile } from '../services/fileProcessor';

const FileUploader = ({ onFilesProcessed, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [processingFiles, setProcessingFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    await handleFiles(files);
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFiles = async (files) => {
    if (files.length === 0) return;

    const newProcessingFiles = files.map(f => ({ name: f.name, status: 'processing' }));
    setProcessingFiles(prev => [...prev, ...newProcessingFiles]);

    const processedResults = [];

    for (const file of files) {
      try {
        const result = await processFile(file);
        processedResults.push(result);
        setProcessingFiles(prev => prev.filter(f => f.name !== file.name));
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        setProcessingFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'error' } : f));
        // Remove error file after delay
        setTimeout(() => {
          setProcessingFiles(prev => prev.filter(f => f.name !== file.name));
        }, 3000);
      }
    }

    if (processedResults.length > 0) {
      onFilesProcessed(processedResults);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className="file-uploader"
        style={{
          borderColor: isDragging ? 'var(--primary-color)' : 'var(--border-color)',
          backgroundColor: isDragging ? 'rgba(var(--primary-color), 0.05)' : 'var(--bg-color)',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept=".pdf,.txt,.md,.json,.jpg,.jpeg,.png,.webp"
        />
        
        <div className="p-2 rounded-full shadow-sm" style={{ backgroundColor: 'var(--bg-color)', display: 'inline-block', marginBottom: '0.5rem' }}>
          <Upload size={20} style={{ color: 'var(--muted-fg)' }} />
        </div>
        <div className="text-xs" style={{ color: 'var(--muted-fg)' }}>
          <span className="font-medium" style={{ color: 'var(--text-color)' }}>Click to upload</span> or drag and drop
          <div className="mt-1 text-[10px]">PDF, TXT, Images (max 10MB)</div>
        </div>
      </div>

      {/* Processing Indicators */}
      {processingFiles.length > 0 && (
        <div className="mt-2 space-y-2" style={{ marginTop: '0.5rem' }}>
          {processingFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs p-2 rounded" style={{ backgroundColor: 'var(--secondary-bg)', marginBottom: '0.5rem' }}>
              <span className="truncate max-w-[200px]" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
              {file.status === 'processing' ? (
                <Loader2 size={14} className="animate-spin" style={{ color: 'var(--primary-color)' }} />
              ) : (
                <span style={{ color: 'var(--destructive)' }}>Error</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;

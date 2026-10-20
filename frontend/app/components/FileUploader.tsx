import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "../../lib/utils";

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
  selectedFile?: File | null;
}

const FileUploader = ({ onFileSelect, selectedFile }: FileUploaderProps) => {
  const [currentFile, setCurrentFile] = useState<File | null>(selectedFile || null);
  const maxFileSize = 20 * 1024 * 1024; // 20MB

  useEffect(() => {
    if (selectedFile !== undefined) {
      setCurrentFile(selectedFile);
    }
  }, [selectedFile]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;
      setCurrentFile(file);
      onFileSelect?.(file);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    maxSize: maxFileSize,
    noClick: !!currentFile, // Don't trigger file dialog when clicking the preview card
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentFile(null);
    onFileSelect?.(null);
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`relative w-full rounded-2xl border-2 transition-all duration-200 ${
          isDragActive
            ? "border-[var(--text-primary)] bg-[var(--bg-surface-secondary)] scale-[0.99]"
            : currentFile
            ? "border-[var(--border-color)] bg-[var(--bg-surface)]"
            : "border-dashed border-[var(--border-color)] hover:border-[var(--text-primary)] bg-[var(--bg-surface)] cursor-pointer"
        }`}
      >
        <input {...getInputProps()} id="resume-file-input" />

        {currentFile ? (
          <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
              {/* PDF Icon Badge */}
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] flex-shrink-0 text-[var(--text-primary)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              {/* File details */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate" title={currentFile.name}>
                  {currentFile.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--text-muted)]">
                  <span>{formatSize(currentFile.size)}</span>
                  <span>•</span>
                  <span className="text-[var(--color-success)] font-medium">Ready for analysis</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border-color)]">
              <button
                type="button"
                onClick={open}
                className="btn-secondary !text-xs !py-1.5 !px-3"
              >
                Change File
              </button>
              <button
                type="button"
                onClick={handleRemove}
                title="Remove file"
                aria-label="Remove uploaded resume"
                className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--color-error)] hover:border-[var(--color-error-border)] hover:bg-[var(--color-error-bg)] transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-10 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {isDragActive ? "Drop your PDF file here" : "Click to select or drag and drop your resume"}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Accepted format: PDF only (maximum file size 20 MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;

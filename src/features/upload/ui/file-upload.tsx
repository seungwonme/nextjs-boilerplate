"use client";

import { Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { type UploadedFile, useFileUpload } from "../hooks/use-file-upload";
import { FilePreview } from "./file-preview";

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (file: UploadedFile, error: string) => void;
  onFilesChange?: (files: UploadedFile[]) => void;
}

export function FileUpload({
  accept,
  maxSize,
  multiple = false,
  disabled = false,
  className,
  onUploadComplete,
  onUploadError,
  onFilesChange,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptArray = accept?.split(",").map((s) => s.trim());

  const { files, isUploading, upload, uploadMultiple, removeFile } =
    useFileUpload({
      maxSize,
      accept: acceptArray,
      onUploadComplete: (file) => {
        onUploadComplete?.(file);
        onFilesChange?.(files);
      },
      onUploadError,
    });

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const fileArray = Array.from(fileList);

      if (multiple) {
        await uploadMultiple(fileArray);
      } else {
        await upload(fileArray[0]);
      }

      onFilesChange?.(files);
    },
    [multiple, upload, uploadMultiple, files, onFilesChange],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles],
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      e.target.value = "";
    },
    [handleFiles],
  );

  const formatMaxSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / 1024 / 1024 / 1024).toFixed(1)}GB`;
    }
    if (bytes >= 1024 * 1024) {
      return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
    }
    return `${(bytes / 1024).toFixed(1)}KB`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* biome-ignore lint/a11y/useSemanticElements: div needed for drag-and-drop */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors",
          "cursor-pointer hover:border-primary/50 hover:bg-muted/50",
          isDragOver && "border-primary bg-primary/5",
          disabled && "cursor-not-allowed opacity-50",
          isUploading && "pointer-events-none",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          className="sr-only"
        />

        <div
          className={cn(
            "rounded-full bg-muted p-3",
            isDragOver && "bg-primary/10",
          )}
        >
          <Upload
            className={cn(
              "h-6 w-6 text-muted-foreground",
              isDragOver && "text-primary",
            )}
          />
        </div>

        <div className="text-center">
          <p className="text-sm font-medium">
            {isDragOver
              ? "파일을 놓아주세요"
              : "파일을 드래그하거나 클릭하여 업로드"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {accept && <span>{accept} </span>}
            {maxSize && <span>(최대 {formatMaxSize(maxSize)})</span>}
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <FilePreview
              key={file.id}
              file={file}
              onRemove={() => removeFile(file.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

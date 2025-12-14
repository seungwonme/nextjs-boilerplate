"use client";

import {
  AlertCircle,
  CheckCircle,
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Loader2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import type { UploadedFile } from "../hooks/use-file-upload";

interface FilePreviewProps {
  file: UploadedFile;
  onRemove?: () => void;
  className?: string;
}

export function FilePreview({ file, onRemove, className }: FilePreviewProps) {
  const isImage = file.file.type.startsWith("image/");

  const imageUrl = useMemo(() => {
    if (isImage && file.status !== "error") {
      return URL.createObjectURL(file.file);
    }
    return null;
  }, [file.file, file.status, isImage]);

  const FileIcon = useMemo(() => {
    const type = file.file.type;

    if (type.startsWith("image/")) return FileImage;
    if (type.startsWith("video/")) return FileVideo;
    if (type.startsWith("audio/")) return FileAudio;
    if (type.includes("pdf") || type.includes("document")) return FileText;
    if (type.includes("zip") || type.includes("archive")) return FileArchive;

    return File;
  }, [file.file.type]);

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const StatusIcon = useMemo(() => {
    switch (file.status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  }, [file.status]);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors",
        file.status === "error" && "border-destructive/50 bg-destructive/5",
        className,
      )}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={file.file.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FileIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{file.file.name}</p>
          {StatusIcon}
        </div>

        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.file.size)}
        </p>

        {file.status === "uploading" && (
          <Progress value={file.progress} className="mt-2 h-1" />
        )}

        {file.status === "error" && file.error && (
          <p className="mt-1 text-xs text-destructive">{file.error}</p>
        )}
      </div>

      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={onRemove}
          disabled={file.status === "uploading"}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">삭제</span>
        </Button>
      )}
    </div>
  );
}

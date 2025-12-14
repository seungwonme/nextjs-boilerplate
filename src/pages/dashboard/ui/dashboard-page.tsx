"use client";

import {
  Download,
  ExternalLink,
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Loader2,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { FileUpload, type UploadedFile } from "@/features/upload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  key: string;
  createdAt: string;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return FileImage;
  if (type.startsWith("video/")) return FileVideo;
  if (type.startsWith("audio/")) return FileAudio;
  if (type.includes("pdf") || type.includes("document")) return FileText;
  if (type.includes("zip") || type.includes("archive")) return FileArchive;
  return File;
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function getFileUrl(key: string) {
  return `/api/files/${key}`;
}

export function DashboardPage() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch("/api/files");
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUploadComplete = async (uploadedFile: UploadedFile) => {
    // DB에 파일 메타데이터 저장
    try {
      const response = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: uploadedFile.id,
          name: uploadedFile.file.name,
          key: uploadedFile.key,
          type: uploadedFile.file.type,
          size: uploadedFile.file.size,
        }),
      });

      if (response.ok) {
        const savedFile = await response.json();
        setFiles((prev) => [savedFile, ...prev]);
      }
    } catch (error) {
      console.error("Failed to save file metadata:", error);
    }
  };

  const handleDelete = async (file: StoredFile) => {
    try {
      const response = await fetch(`/api/files/${file.key}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== file.id));
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">파일 관리</h1>
        <p className="mt-2 text-muted-foreground">
          파일을 업로드하고 관리하세요
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>파일 업로드</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
            maxSize={50 * 1024 * 1024}
            multiple
            onUploadComplete={handleUploadComplete}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>업로드된 파일 ({files.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <File className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                업로드된 파일이 없습니다
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onDelete={() => handleDelete(file)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FileCard({
  file,
  onDelete,
}: {
  file: StoredFile;
  onDelete: () => void;
}) {
  const isImage = file.type.startsWith("image/");
  const Icon = getFileIcon(file.type);
  const fileUrl = getFileUrl(file.key);

  return (
    <Card className="group overflow-hidden">
      <div className="relative aspect-video bg-muted">
        {isImage ? (
          <Image
            src={fileUrl}
            alt={file.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <Button size="icon" variant="secondary" asChild>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button size="icon" variant="secondary" asChild>
            <a href={fileUrl} download={file.name}>
              <Download className="h-4 w-4" />
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>파일 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  &quot;{file.name}&quot; 파일을 삭제하시겠습니까? 이 작업은
                  되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>삭제</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <CardContent className="p-3">
        <p className="truncate text-sm font-medium" title={file.name}>
          {file.name}
        </p>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatFileSize(file.size)}</span>
          <span>{formatDate(file.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

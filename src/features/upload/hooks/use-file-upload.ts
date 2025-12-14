"use client";

import { useCallback, useState } from "react";

export interface UploadedFile {
  id: string;
  file: File;
  key: string;
  publicUrl: string;
  status: "idle" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

interface UploadOptions {
  maxSize?: number;
  accept?: string[];
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (file: UploadedFile, error: string) => void;
}

interface UseFileUploadReturn {
  files: UploadedFile[];
  isUploading: boolean;
  upload: (file: File) => Promise<UploadedFile | null>;
  uploadMultiple: (files: File[]) => Promise<UploadedFile[]>;
  removeFile: (id: string) => void;
  clearFiles: () => void;
}

export function useFileUpload(
  options: UploadOptions = {},
): UseFileUploadReturn {
  const { maxSize, accept, onUploadComplete, onUploadError } = options;
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        const maxMB = (maxSize / 1024 / 1024).toFixed(1);
        return `파일 크기가 ${maxMB}MB를 초과합니다`;
      }

      if (accept && accept.length > 0) {
        const fileType = file.type;
        const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;

        const isAccepted = accept.some((type) => {
          if (type.startsWith(".")) {
            return fileExt === type.toLowerCase();
          }
          if (type.endsWith("/*")) {
            return fileType.startsWith(type.replace("/*", "/"));
          }
          return fileType === type;
        });

        if (!isAccepted) {
          return `허용되지 않는 파일 형식입니다`;
        }
      }

      return null;
    },
    [maxSize, accept],
  );

  const upload = useCallback(
    async (file: File): Promise<UploadedFile | null> => {
      const id = crypto.randomUUID();
      const validationError = validateFile(file);

      const uploadedFile: UploadedFile = {
        id,
        file,
        key: "",
        publicUrl: "",
        status: validationError ? "error" : "idle",
        progress: 0,
        error: validationError ?? undefined,
      };

      setFiles((prev) => [...prev, uploadedFile]);

      if (validationError) {
        onUploadError?.(uploadedFile, validationError);
        return null;
      }

      try {
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: "uploading" } : f)),
        );

        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
          }),
        });

        if (!response.ok) {
          throw new Error("Presigned URL 발급 실패");
        }

        const { presignedUrl, key, publicUrl } = await response.json();

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setFiles((prev) =>
                prev.map((f) => (f.id === id ? { ...f, progress } : f)),
              );
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`업로드 실패: ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () =>
            reject(new Error("네트워크 오류")),
          );

          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        const successFile: UploadedFile = {
          id,
          file,
          key,
          publicUrl,
          status: "success",
          progress: 100,
        };

        setFiles((prev) => prev.map((f) => (f.id === id ? successFile : f)));
        onUploadComplete?.(successFile);

        return successFile;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "업로드 실패";

        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, status: "error", error: errorMessage } : f,
          ),
        );

        const errorFile = files.find((f) => f.id === id);
        if (errorFile) {
          onUploadError?.(errorFile, errorMessage);
        }

        return null;
      }
    },
    [validateFile, onUploadComplete, onUploadError, files],
  );

  const uploadMultiple = useCallback(
    async (fileList: File[]): Promise<UploadedFile[]> => {
      const results = await Promise.all(fileList.map(upload));
      return results.filter((f): f is UploadedFile => f !== null);
    },
    [upload],
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const isUploading = files.some((f) => f.status === "uploading");

  return {
    files,
    isUploading,
    upload,
    uploadMultiple,
    removeFile,
    clearFiles,
  };
}

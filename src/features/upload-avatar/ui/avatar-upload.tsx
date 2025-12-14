"use client";

import { useState } from "react";
import { LuUpload } from "react-icons/lu";
import { updateProfile } from "@/entities/user";
import { Button, Input, Label } from "@/shared/ui";
import { uploadAvatar } from "../api/actions";

interface AvatarUploadProps {
  userId: string;
  onUploadComplete?: (url: string) => void;
}

export function AvatarUpload({ userId, onUploadComplete }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    const result = await uploadAvatar(formData);

    if (result.error) {
      setError(result.error);
      setUploading(false);
      return;
    }

    if (result.url) {
      const profileResult = await updateProfile(userId, {
        avatar_url: result.url,
      });

      if (profileResult.error) {
        setError(profileResult.error);
        setUploading(false);
        return;
      }

      onUploadComplete?.(result.url);
    }

    setUploading(false);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="avatar-upload" className="cursor-pointer">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          className="gap-2"
          asChild
        >
          <span>
            <LuUpload className="size-4" />
            {uploading ? "Uploading..." : "Upload Avatar"}
          </span>
        </Button>
      </Label>
      <Input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
      />
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

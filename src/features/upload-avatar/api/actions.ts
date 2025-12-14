"use server";

import { createServerClient } from "@/shared/api/supabase";
import { verifySession } from "@/shared/lib";

export async function uploadAvatar(formData: FormData) {
  // Verify authentication
  const { isAuth, user } = await verifySession();

  if (!isAuth || !user) {
    return { url: null, error: "Unauthorized" };
  }

  const supabase = await createServerClient();
  const file = formData.get("file") as File;
  const userId = formData.get("userId") as string;

  if (!file || !userId) {
    return { url: null, error: "Missing file or user ID" };
  }

  // Only allow users to upload their own avatar
  if (user.id !== userId) {
    return { url: null, error: "Forbidden" };
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
    });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  return { url: publicUrl, error: null };
}

export async function deleteAvatar(avatarUrl: string) {
  // Verify authentication
  const { isAuth } = await verifySession();

  if (!isAuth) {
    return { error: "Unauthorized" };
  }

  const supabase = await createServerClient();

  // Extract file path from URL
  const urlParts = avatarUrl.split("/avatars/");
  if (urlParts.length !== 2) {
    return { error: "Invalid avatar URL" };
  }

  const filePath = urlParts[1];

  const { error } = await supabase.storage.from("avatars").remove([filePath]);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

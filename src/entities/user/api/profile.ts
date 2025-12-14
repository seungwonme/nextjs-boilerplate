"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/shared/api/supabase";
import { verifySession } from "@/shared/lib";
import type { ProfileUpdate } from "../model/types";

export async function getProfile(userId: string) {
  // Verify authentication
  const { isAuth, user } = await verifySession();

  if (!isAuth || !user) {
    return { profile: null, error: "Unauthorized" };
  }

  // Only allow users to get their own profile
  if (user.id !== userId) {
    return { profile: null, error: "Forbidden" };
  }

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    return { profile: null, error: error.message };
  }

  return { profile: data, error: null };
}

export async function updateProfile(userId: string, updates: ProfileUpdate) {
  // Verify authentication
  const { isAuth, user } = await verifySession();

  if (!isAuth || !user) {
    return { profile: null, error: "Unauthorized" };
  }

  // Only allow users to update their own profile
  if (user.id !== userId) {
    return { profile: null, error: "Forbidden" };
  }

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return { profile: null, error: error.message };
  }

  revalidatePath("/", "layout");
  return { profile: data, error: null };
}

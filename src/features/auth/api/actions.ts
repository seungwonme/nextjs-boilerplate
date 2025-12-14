"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/shared/api/supabase";
import { verifySession } from "@/shared/lib";
import { signInSchema, signUpSchema } from "../model/schemas";

export async function signInWithEmail(formData: FormData) {
  // Validate form fields
  const validatedFields = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // If validation fails, return errors
  if (!validatedFields.success) {
    const firstError = validatedFields.error.issues[0];
    return {
      error: firstError?.message || "Validation failed",
    };
  }

  const supabase = await createServerClient();

  const { error } = await supabase.auth.signInWithPassword(
    validatedFields.data,
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUpWithEmail(formData: FormData) {
  // Validate form fields
  const validatedFields = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  });

  // If validation fails, return errors
  if (!validatedFields.success) {
    const firstError = validatedFields.error.issues[0];
    return {
      error: firstError?.message || "Validation failed",
    };
  }

  const supabase = await createServerClient();

  const { error } = await supabase.auth.signUp({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
    options: {
      data: {
        full_name: validatedFields.data.fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  // Verify session before sign out
  const { isAuth } = await verifySession();

  if (!isAuth) {
    return { error: "Not authenticated" };
  }

  const supabase = await createServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/auth/login");
}

export async function getUser() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return { user: null, error: error.message };
  }

  return { user, error: null };
}

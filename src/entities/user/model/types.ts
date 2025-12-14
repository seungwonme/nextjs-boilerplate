import type { Tables } from "@/shared/api/supabase";

export type Profile = Tables<"profiles">;

export type ProfileUpdate = Partial<
  Pick<Profile, "username" | "full_name" | "avatar_url" | "website">
>;

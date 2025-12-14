import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui";
import type { Profile } from "../model/types";

interface UserAvatarProps {
  profile: Profile | null;
  className?: string;
}

export function UserAvatar({ profile, className }: UserAvatarProps) {
  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <Avatar className={className}>
      {profile?.avatar_url && (
        <AvatarImage src={profile.avatar_url} alt={profile.full_name || ""} />
      )}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}

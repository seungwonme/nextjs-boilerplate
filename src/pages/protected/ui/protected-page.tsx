import { redirect } from "next/navigation";
import { SignOutButton } from "@/features/auth";
import { verifySession } from "@/shared/lib";

export async function ProtectedPage() {
  // Use DAL pattern for authentication check
  const { isAuth, user } = await verifySession();

  if (!isAuth || !user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-svh w-full items-center justify-center gap-2">
      <p>
        Hello <span>{user.email}</span>
      </p>
      <SignOutButton />
    </div>
  );
}

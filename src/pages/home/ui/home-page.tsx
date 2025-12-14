import Link from "next/link";
import { SignOutButton } from "@/features/auth";
import { createClient } from "@/shared/api/supabase/server";
import { Button, ThemeToggle } from "@/shared/ui";

export async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1>Boilerplate Next.js</h1>
      {user ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Logged in as <span className="font-medium">{user.email}</span>
          </p>
          <SignOutButton />
        </div>
      ) : (
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/sign-up">Sign Up</Link>
          </Button>
        </div>
      )}
      <ThemeToggle />
    </div>
  );
}

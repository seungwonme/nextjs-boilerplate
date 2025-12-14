import { redirect } from "next/navigation";
import { SignInForm } from "@/features/auth";

export async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;

  // Redirect to /auth/confirm if code is present
  // This handles the case where Supabase sends users to /auth/login?code=...
  if (params.code) {
    redirect(`/auth/confirm?code=${params.code}`);
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignInForm />
      </div>
    </div>
  );
}

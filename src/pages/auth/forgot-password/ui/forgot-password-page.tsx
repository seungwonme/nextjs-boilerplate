import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";

export function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This feature is coming soon.
            </p>
            <Link href="/auth/login" className="text-sm underline">
              Back to login
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

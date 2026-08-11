"use client";

import { useState } from "react";
import { Button, Input, Label } from "@/shared/ui";
import { signUpWithEmail } from "../api/actions";

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      const result = await signUpWithEmail(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError("Unable to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4" aria-busy={loading}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
        />
      </div>

      {error && (
        <p
          role="alert"
          aria-live="assertive"
          className="text-sm text-red-500 dark:text-red-400"
        >
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing up..." : "Sign Up"}
      </Button>
    </form>
  );
}

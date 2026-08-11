"use client";

import { useState } from "react";
import { LuLogOut } from "react-icons/lu";
import { Button } from "@/shared/ui";
import { signOut } from "../api/actions";

export function SignOutButton() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    setError(null);

    try {
      const result = await signOut();
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError("Unable to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="gap-2"
        disabled={loading}
        aria-busy={loading}
      >
        <LuLogOut className="size-4" aria-hidden="true" />
        {loading ? "Signing out..." : "Sign Out"}
      </Button>
      {error && (
        <p
          role="alert"
          aria-live="assertive"
          className="text-sm text-red-500 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}

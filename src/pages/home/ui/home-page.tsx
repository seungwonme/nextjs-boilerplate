"use client";

import {
  SignedIn,
  SignedOut,
  UserButton,
} from "@neondatabase/neon-js/auth/react/ui";
import Link from "next/link";
import { ThemeToggle } from "@/shared/ui";

export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-2xl font-bold">Boilerplate Next.js</h1>

      <SignedIn>
        <div className="flex flex-col items-center gap-4">
          <p>You&apos;re signed in!</p>
          <UserButton />
        </div>
      </SignedIn>

      <SignedOut>
        <div className="flex gap-4">
          <Link
            href="/auth/sign-in"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Sign In
          </Link>
          <Link
            href="/auth/sign-up"
            className="px-4 py-2 border border-input rounded-md hover:bg-accent"
          >
            Sign Up
          </Link>
        </div>
      </SignedOut>

      <ThemeToggle />
    </div>
  );
}

import { ThemeToggle } from "@/shared/ui";

export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1>Boilerplate Next.js</h1>
      <ThemeToggle />
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardPage } from "@/pages/dashboard";
import { getSession } from "@/shared/lib/auth-server";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "파일을 업로드하고 관리하세요",
};

export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  return <DashboardPage />;
}

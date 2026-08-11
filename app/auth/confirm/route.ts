import type { NextRequest } from "next/server";
import { handleAuthConfirmation } from "@/shared/api";

export async function GET(request: NextRequest) {
  return handleAuthConfirmation(request);
}

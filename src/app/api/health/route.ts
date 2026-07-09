export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { initSchemaOnce } from "@/lib/db";

/**
 * Health check endpoint — ensures database schema on first request.
 * This avoids build timeouts by deferring schema initialization until
 * the app is running and can handle connection failures gracefully.
 */
export async function GET() {
  // Try to initialize schema (idempotent, only runs once)
  await initSchemaOnce();

  return NextResponse.json({ status: "ok" }, { status: 200 });
}

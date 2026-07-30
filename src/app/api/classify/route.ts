import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { classifyReport } from "@/lib/gemini";
import { rateLimit } from "@/lib/rateLimit";

// Matches the 5 MB storage bucket limit; base64 inflates size by ~4/3.
const MAX_PHOTO_BASE64_LENGTH = 7_000_000;

const classifySchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000),
  photoBase64: z.string().max(MAX_PHOTO_BASE64_LENGTH).optional(),
  photoMimeType: z
    .enum(["image/jpeg", "image/png", "image/webp", "image/heic"])
    .optional(),
});

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Anda harus masuk terlebih dahulu." }, { status: 401 });
  }

  // Per-user limit is primary (this endpoint requires auth); per-IP is a
  // looser secondary guard against one source spinning up many accounts.
  // Both protect the Gemini free-tier quota from being burned by a script.
  const userLimit = rateLimit(`classify:user:${user.id}`, {
    limit: 8,
    windowMs: 5 * 60 * 1000,
  });
  const ipLimit = rateLimit(`classify:ip:${clientIp(request)}`, {
    limit: 30,
    windowMs: 5 * 60 * 1000,
  });

  if (!userLimit.allowed || !ipLimit.allowed) {
    const retryAfterMs = Math.max(userLimit.retryAfterMs, ipLimit.retryAfterMs);
    return NextResponse.json(
      { error: "Terlalu banyak permintaan klasifikasi. Coba lagi sebentar lagi." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = classifySchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid: " + parsed.error.issues[0]?.message },
      { status: 400 },
    );
  }

  try {
    const result = await classifyReport(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Gemini classify error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengklasifikasikan laporan.",
      },
      { status: 502 },
    );
  }
}

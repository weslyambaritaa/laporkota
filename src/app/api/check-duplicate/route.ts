import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkDuplicate } from "@/lib/gemini";
import { rateLimit } from "@/lib/rateLimit";
import { haversineMeters } from "@/lib/geo";

// ~220m bounding box pre-filter (cheap DB query), narrowed to a 150m
// radius via haversine below before anything is sent to Gemini.
const BOUNDING_BOX_DEGREES = 0.002;
const MAX_DISTANCE_METERS = 150;
const MAX_CANDIDATES = 5;

const duplicateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  category: z.enum([
    "jalan",
    "sampah",
    "penerangan",
    "drainase",
    "fasilitas_umum",
    "lainnya",
  ]),
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

  const userLimit = rateLimit(`duplicate:user:${user.id}`, {
    limit: 10,
    windowMs: 5 * 60 * 1000,
  });
  const ipLimit = rateLimit(`duplicate:ip:${clientIp(request)}`, {
    limit: 30,
    windowMs: 5 * 60 * 1000,
  });

  if (!userLimit.allowed || !ipLimit.allowed) {
    const retryAfterMs = Math.max(userLimit.retryAfterMs, ipLimit.retryAfterMs);
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = duplicateSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid: " + parsed.error.issues[0]?.message },
      { status: 400 },
    );
  }

  const { title, description, lat, lng, category } = parsed.data;

  const { data: nearby, error: queryError } = await supabase
    .from("reports")
    .select("id,title,description,lat,lng")
    .eq("category", category)
    .in("status", ["diterima", "diproses"])
    .gte("lat", lat - BOUNDING_BOX_DEGREES)
    .lte("lat", lat + BOUNDING_BOX_DEGREES)
    .gte("lng", lng - BOUNDING_BOX_DEGREES)
    .lte("lng", lng + BOUNDING_BOX_DEGREES)
    .limit(20);

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  const candidates = (nearby ?? [])
    .map((r) => ({
      id: r.id as string,
      title: r.title as string,
      description: r.description as string,
      distanceMeters: haversineMeters(lat, lng, r.lat as number, r.lng as number),
    }))
    .filter((c) => c.distanceMeters <= MAX_DISTANCE_METERS)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, MAX_CANDIDATES);

  if (candidates.length === 0) {
    return NextResponse.json({ duplicate: null, reason: "" });
  }

  try {
    const { duplicateId, reason } = await checkDuplicate({ title, description, candidates });
    const match = duplicateId ? candidates.find((c) => c.id === duplicateId) : null;
    return NextResponse.json({
      duplicate: match ? { id: match.id, title: match.title } : null,
      reason,
    });
  } catch (error) {
    console.error("Gemini duplicate-check error:", error);
    // Fail open: if the AI check errors out, don't block report submission
    // over a non-critical convenience feature.
    return NextResponse.json({ duplicate: null, reason: "" });
  }
}

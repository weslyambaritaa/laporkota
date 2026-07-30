import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rateLimit";

// Public, read-only open-data endpoint over the same reports the public
// map already shows — no auth required, since none of this is more
// sensitive than what /peta already renders. Reporter identity is
// intentionally left out here: viewing one report's name in the UI is
// different from letting anyone bulk-scrape a name↔location dataset.
function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function GET(request: Request) {
  const ipLimit = rateLimit(`public-data:ip:${clientIp(request)}`, {
    limit: 60,
    windowMs: 60 * 1000,
  });

  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(ipLimit.retryAfterMs / 1000)) } },
    );
  }

  const supabase = await createClient();
  const { data: reports, error } = await supabase
    .from("reports")
    .select(
      "id,title,description,category,urgency,status,lat,lng,address,upvote_count,after_photo_url,created_at,updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  const cacheHeaders = {
    // Non-sensitive, low-churn public data — safe to cache briefly at the
    // edge/CDN and reduce load on both this route and the database.
    "Cache-Control": "public, max-age=60, s-maxage=300",
  };

  if (format === "geojson") {
    return NextResponse.json(
      {
        type: "FeatureCollection",
        generatedAt: new Date().toISOString(),
        features: (reports ?? []).map((r) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [r.lng, r.lat] },
          properties: {
            id: r.id,
            title: r.title,
            description: r.description,
            category: r.category,
            urgency: r.urgency,
            status: r.status,
            address: r.address,
            upvoteCount: r.upvote_count,
            afterPhotoUrl: r.after_photo_url,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          },
        })),
      },
      { headers: cacheHeaders },
    );
  }

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      total: reports?.length ?? 0,
      reports: (reports ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        urgency: r.urgency,
        status: r.status,
        lat: r.lat,
        lng: r.lng,
        address: r.address,
        upvoteCount: r.upvote_count,
        afterPhotoUrl: r.after_photo_url,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    },
    { headers: cacheHeaders },
  );
}

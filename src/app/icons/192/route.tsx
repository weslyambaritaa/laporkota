import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0071e3",
          fontSize: 110,
          fontWeight: 700,
          color: "#ffffff",
        }}
      >
        L
      </div>
    ),
    { width: 192, height: 192 },
  );
}

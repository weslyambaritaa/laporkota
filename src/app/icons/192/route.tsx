import { ImageResponse } from "next/og";
import { getLogoDataUri } from "@/lib/appIcon";

export const dynamic = "force-static";

export async function GET() {
  const logo = getLogoDataUri();
  const size = 192;

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
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} width={size} height={size} alt="" />
        ) : (
          "L"
        )}
      </div>
    ),
    { width: size, height: size },
  );
}

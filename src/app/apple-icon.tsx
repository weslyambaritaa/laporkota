import { ImageResponse } from "next/og";
import { getLogoDataUri } from "@/lib/appIcon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const logo = getLogoDataUri();

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
          <img src={logo} width={size.width} height={size.height} alt="" />
        ) : (
          "L"
        )}
      </div>
    ),
    size,
  );
}

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const LOGO_PATH = join(process.cwd(), "public", "logo.png");

// Route/icon generators run server-side (Node runtime) at build time, so
// they can read the file directly instead of fetching it over HTTP. Falls
// back to null until the user drops a logo.png into public/.
export function getLogoDataUri(): string | null {
  if (!existsSync(LOGO_PATH)) return null;
  const base64 = readFileSync(LOGO_PATH).toString("base64");
  return `data:image/png;base64,${base64}`;
}

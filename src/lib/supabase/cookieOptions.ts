/**
 * Shared cookie hardening for every Supabase client (browser, server, proxy).
 *
 * - `sameSite: "lax"` stops the auth cookie from being sent on cross-site
 *   requests, which blocks CSRF against our authenticated endpoints
 *   (/api/classify, admin status updates) without any extra token needed.
 * - `secure` is forced in production so the session cookie is never sent
 *   over plain HTTP (mitigates network-sniffing session hijack). It's left
 *   off in local dev since `next dev` normally runs on http://localhost.
 *
 * Note: these cookies are intentionally NOT httpOnly — @supabase/ssr's
 * browser client reads the session directly from document.cookie to avoid
 * a network round-trip on load. That means the real defense against
 * session-hijack-via-XSS is preventing XSS in the first place (React's
 * default escaping, no dangerouslySetInnerHTML, and the CSP in
 * next.config.ts) — see SECURITY.md.
 */
export const supabaseCookieOptions = {
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

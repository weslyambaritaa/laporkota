import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionProfile();

  if (!session) redirect("/login?next=/admin");
  if (session.profile?.role !== "admin") redirect("/");

  return <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>;
}

import { getTenant } from "@/lib/dal/context";
import { can } from "@/lib/auth/permissions";
import type { Role } from "@/lib/constants/enums";
import { SettingsNav } from "./settings-nav";

/**
 * Settings shell — a left sub-nav (org vs. personal split, per the brief's
 * research notes) with Organization/Members/Audit Log hidden for roles that
 * can't reach them, matching what the server actions themselves enforce.
 */
export default async function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await getTenant();
  const role = user.role as Role;

  const items = [
    { href: "/settings/profile", label: "Profile", visible: true },
    { href: "/settings/organization", label: "Organization", visible: can({ role }, "org:edit") },
    { href: "/settings/members", label: "Members", visible: can({ role }, "member:manage") },
    { href: "/settings/audit", label: "Audit log", visible: can({ role }, "audit:view") },
  ].filter((item) => item.visible);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, workspace, and team.
        </p>
      </div>
      <div className="flex flex-col gap-8 md:flex-row">
        <SettingsNav items={items} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

import { requireOrg } from "@/lib/auth/session";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import type { Role } from "@/lib/constants/enums";

/**
 * Authenticated app shell — requires a user with an org. Renders the sidebar
 * on desktop, a top bar with mobile drawer on smaller screens, and the main
 * content area in the centre capped at 1280px.
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await requireOrg();

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          user={{
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role as Role,
          }}
        />
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1280px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

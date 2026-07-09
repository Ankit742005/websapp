import type { Role } from "@/lib/constants/enums";
import { MobileSidebar } from "./sidebar";
import { UserMenu } from "./user-menu";

interface TopbarProps {
  user: {
    name: string | null | undefined;
    email: string | null | undefined;
    image: string | null | undefined;
    role: Role;
  };
}

/**
 * Top bar for the authenticated app shell. Sits above the main content area,
 * provides the mobile nav trigger on the left and user menu on the right.
 */
export function Topbar({ user }: TopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 lg:px-6">
      <MobileSidebar />
      <div className="ml-auto">
        <UserMenu
          name={user.name}
          email={user.email}
          image={user.image}
          role={user.role}
        />
      </div>
    </header>
  );
}

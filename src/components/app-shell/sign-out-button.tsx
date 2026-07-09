"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

/**
 * Sign-out button that calls the client-side signOut to clear the session
 * and redirect to login. Used in the user menu dropdown.
 */
export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ redirectTo: "/login" })}
      className="flex w-full items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
    >
      <LogOut className="size-4" />
      Sign out
    </button>
  );
}

"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OnboardingSignOutButton() {
  return (
    <Button variant="outline" onClick={() => signOut({ redirectTo: "/login" })}>
      <LogOut className="mr-2 size-4" />
      Sign out
    </Button>
  );
}

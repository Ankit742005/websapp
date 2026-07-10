import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OnboardingSignOutButton } from "./sign-out-button";
import { Building2 } from "lucide-react";

export const metadata: Metadata = { title: "No workspace" };

/**
 * Safety-net destination for a signed-in user with no `orgId` — either an
 * OAuth sign-in with no invite yet, or a member who was just removed from
 * their workspace. There is no self-serve "create a workspace" flow in this
 * build (single-org-per-user model); an Owner must add the user back.
 */
export default async function OnboardingPage() {
  await requireUser();

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
          <Building2 className="size-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">No workspace yet</CardTitle>
        <CardDescription>
          Your account isn&apos;t part of a Deskly workspace. Ask an Owner or Admin to add you by
          email from their Settings &rarr; Members page, or sign in with a different account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <OnboardingSignOutButton />
      </CardContent>
    </Card>
  );
}

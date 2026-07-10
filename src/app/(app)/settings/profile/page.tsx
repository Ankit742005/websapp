import type { Metadata } from "next";
import { getTenant } from "@/lib/dal/context";
import { ROLE_META } from "@/lib/constants/display";
import type { Role } from "@/lib/constants/enums";
import { StatusDot } from "@/components/status-dot";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfileSettingsPage() {
  const { user } = await getTenant();
  const roleMeta = ROLE_META[user.role as Role];

  return (
    <div className="max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
          <CardDescription>
            Signed in as {user.email} · <StatusDot meta={roleMeta} className="inline-flex" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm defaultName={user.name ?? ""} defaultImage={user.image ?? ""} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change the password used to sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}

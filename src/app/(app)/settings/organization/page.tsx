import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTenant } from "@/lib/dal/context";
import { prisma } from "@/lib/db";
import { can } from "@/lib/auth/permissions";
import type { Role } from "@/lib/constants/enums";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OrganizationForm } from "./organization-form";

export const metadata: Metadata = { title: "Organization" };

export default async function OrganizationSettingsPage() {
  const { user, orgId } = await getTenant();
  if (!can({ role: user.role as Role }, "org:edit")) notFound();

  const org = await prisma.organization.findUniqueOrThrow({
    where: { id: orgId },
    select: { name: true, slug: true, createdAt: true },
  });

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Organization</CardTitle>
        <CardDescription>Workspace-wide settings visible to your whole team.</CardDescription>
      </CardHeader>
      <CardContent>
        <OrganizationForm defaultName={org.name} slug={org.slug} />
      </CardContent>
    </Card>
  );
}

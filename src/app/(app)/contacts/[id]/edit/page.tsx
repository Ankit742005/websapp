import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTenant } from "@/lib/dal/context";
import { getContact } from "@/lib/dal/contacts";
import { EditContactForm } from "./edit-contact-form";

interface EditContactPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Edit Contact" };

export default async function EditContactPage({ params }: EditContactPageProps) {
  const { id } = await params;
  const { orgId } = await getTenant();
  const contact = await getContact(orgId, id);

  if (!contact) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <EditContactForm contact={contact} />
    </div>
  );
}

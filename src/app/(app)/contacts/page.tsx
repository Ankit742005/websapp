import type { Metadata } from "next";
import Link from "next/link";
import { getTenant } from "@/lib/dal/context";
import { getContacts } from "@/lib/dal/contacts";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = { title: "Contacts" };

export default async function ContactsPage() {
  const { orgId } = await getTenant();
  const contacts = await getContacts(orgId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground">
            {contacts.length}{" "}
            {contacts.length === 1 ? "contact" : "contacts"}
          </p>
        </div>
        <Button asChild>
          <Link href="/contacts/new">
            <Plus className="mr-2 size-4" />
            New contact
          </Link>
        </Button>
      </div>

      {contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No contacts yet. Add your first customer contact.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/contacts/new">
              <Plus className="mr-2 size-4" />
              Add contact
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Company</TableHead>
                <TableHead className="hidden sm:table-cell text-right">
                  Tickets
                </TableHead>
                <TableHead className="hidden lg:table-cell text-right">
                  Added
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {contact.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {contact.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {contact.company ?? "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-right">
                    <Badge variant="secondary">
                      {contact._count.tickets}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-right text-sm text-muted-foreground">
                    {formatDistanceToNow(contact.createdAt, {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

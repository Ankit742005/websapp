import type { Metadata } from "next";
import { CreateContactForm } from "./create-contact-form";

export const metadata: Metadata = { title: "New Contact" };

export default function NewContactPage() {
  return (
    <div className="mx-auto max-w-lg">
      <CreateContactForm />
    </div>
  );
}

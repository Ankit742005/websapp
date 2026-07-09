"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateContactSchema,
  type UpdateContactInput,
} from "@/lib/validations/contact";
import { updateContactAction } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditContactFormProps {
  contact: {
    id: string;
    name: string;
    email: string;
    company: string | null;
  };
}

export function EditContactForm({ contact }: EditContactFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateContactInput>({
    resolver: zodResolver(updateContactSchema),
    defaultValues: {
      name: contact.name,
      email: contact.email,
      company: contact.company,
    },
  });

  function onSubmit(data: UpdateContactInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await updateContactAction(contact.id, data);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      toast.success("Contact updated");
      router.push(`/contacts/${contact.id}`);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit contact</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {serverError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company (optional)</Label>
            <Input id="company" {...register("company")} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

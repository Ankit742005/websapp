"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  updateOrganizationSchema,
  type UpdateOrganizationInput,
} from "@/lib/validations/organization";
import { updateOrganizationAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";

export function OrganizationForm({
  defaultName,
  slug,
}: {
  defaultName: string;
  slug: string;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateOrganizationInput>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: { name: defaultName },
  });

  function onSubmit(data: UpdateOrganizationInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await updateOrganizationAction(data);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      toast.success("Workspace updated");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {serverError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Workspace name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Workspace URL</Label>
        <p className="text-sm text-muted-foreground">deskly.app/{slug}</p>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
        Save changes
      </Button>
    </form>
  );
}

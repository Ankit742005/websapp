"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportCSVButton() {
  const searchParams = useSearchParams();

  const handleExport = () => {
    const qs = searchParams.toString();
    const url = qs ? `/api/tickets/export?${qs}` : "/api/tickets/export";
    // We use a simple window.location.href to trigger the file download
    window.location.href = url;
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}

export function ExportPDFButton({ ticketId }: { ticketId: string }) {
  const handleExport = () => {
    window.open(`/api/tickets/${ticketId}/pdf`, "_blank");
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export PDF
    </Button>
  );
}

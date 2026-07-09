import { NextRequest } from "next/server";
import { getTenant } from "@/lib/dal/context";
import { getTicketWithDetails } from "@/lib/dal/tickets";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { format } from "date-fns";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const { orgId } = await getTenant();
    
    const ticket = await getTicketWithDetails(orgId, id);
    if (!ticket) {
      return new Response("Ticket not found", { status: 404 });
    }

    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    // Add a blank page
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const drawText = (text: string, x: number, y: number, font = timesRomanFont, size = 12) => {
      page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
    };

    // Draw Header
    drawText(`Ticket #${ticket.number}`, 50, height - 50, timesRomanBold, 24);
    drawText(ticket.subject, 50, height - 80, timesRomanBold, 16);

    // Draw Metadata
    let currentY = height - 120;
    const meta = [
      `Status: ${ticket.status}`,
      `Priority: ${ticket.priority}`,
      `Requester: ${ticket.contact.name} (${ticket.contact.email})`,
      `Assignee: ${ticket.assignee?.name ?? "Unassigned"}`,
      `Created: ${format(ticket.createdAt, "PPP p")}`,
    ];

    meta.forEach((line) => {
      drawText(line, 50, currentY);
      currentY -= 20;
    });

    currentY -= 20;
    drawText("Description:", 50, currentY, timesRomanBold, 14);
    currentY -= 20;

    // A very basic text wrap implementation for the body
    const maxLineWidth = width - 100;
    const words = ticket.body.split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const textWidth = timesRomanFont.widthOfTextAtSize(testLine, 12);
      if (textWidth > maxLineWidth && currentLine !== "") {
        drawText(currentLine, 50, currentY);
        currentY -= 20;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      drawText(currentLine, 50, currentY);
    }

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="ticket-${ticket.number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF Export failed:", error);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}

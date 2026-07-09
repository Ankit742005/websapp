import "server-only";
import { siteConfig } from "@/lib/site";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

/**
 * Transactional email. The demo ships without an email provider, so messages
 * are logged server-side and the caller surfaces the action link in-app (see
 * the register/forgot flows). Wire a provider (e.g. Resend) here for production
 * by branching on an API key — the call sites don't change.
 */
export async function sendEmail(
  message: EmailMessage,
): Promise<{ delivered: boolean }> {
  console.info(
    `[email] to=${message.to} subject="${message.subject}"\n${message.text}`,
  );
  return { delivered: false };
}

export function absoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

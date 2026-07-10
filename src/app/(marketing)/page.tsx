import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  Inbox,
  BarChart3,
  ShieldCheck,
  Command,
  Moon,
  FileDown,
  ArrowRight,
  Check,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Deskly — The support desk your team will actually enjoy",
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

const SOFTWARE_APPLICATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  description: siteConfig.description,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: siteConfig.url,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const FEATURES = [
  {
    icon: Inbox,
    title: "A ticket queue built for speed",
    description:
      "Server-side search, filters, and sort on every column — fast at 25 rows or 25,000. Every view is a URL, so it's shareable and survives the back button.",
  },
  {
    icon: BarChart3,
    title: "Analytics that mean something",
    description:
      "Resolution rate, first-response time, and volume trends computed from your real ticket data — not vanity metrics. Pick a 7, 30, or 90-day window.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access, enforced server-side",
    description:
      "Owner, Admin, Agent, Viewer — four roles with real limits. Only an Owner can hand out Owner or Admin, and every mutation is checked again on the server, not just hidden in the UI.",
  },
  {
    icon: Command,
    title: "A command palette, not a maze of menus",
    description:
      "Press ⌘K from anywhere to jump to a ticket, find a contact, or navigate — no mouse required. Every action has a keyboard path.",
  },
  {
    icon: Moon,
    title: "Dark mode, actually designed",
    description:
      "Not an inverted filter — surfaces are elevated with lighter grays, accents are desaturated, and there's zero flash on load.",
  },
  {
    icon: FileDown,
    title: "Export what you filtered",
    description:
      "CSV for the whole team, a branded PDF for a single ticket — both respect whatever search and filters are currently active.",
  },
];

const CHECKLIST = [
  "Real authentication — email/password with hashed sessions, plus optional Google/GitHub",
  "An immutable audit log — every change, who made it, and when",
  "Soft-deleted tickets, org-scoped data, and cross-tenant isolation that's actually tested",
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user?.orgId) redirect("/dashboard");

  return (
    <>
      <JsonLd data={SOFTWARE_APPLICATION_JSON_LD} />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
        <span className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          Open source · MIT licensed
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
          The support desk your team will actually enjoy
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground text-balance">
          Deskly is a fast, keyboard-first helpdesk for lean support teams — real analytics,
          role-based access, and a ticket queue that never feels like it&apos;s fighting you.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/register">
              Get started free
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">
              Try the demo
              <span className="ml-2 text-xs text-muted-foreground">
                demo@deskly.app
              </span>
            </Link>
          </Button>
        </div>

        <div className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-xl border bg-card shadow-2xl shadow-primary/5">
          <Image
            src="/screenshots/dashboard.png"
            alt="Deskly dashboard showing open ticket counts, resolution rate, a 30-day volume chart, and an agent leaderboard"
            width={2400}
            height={1500}
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="w-full"
          />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything a support team needs. Nothing it doesn&apos;t.
            </h2>
            <p className="mt-4 text-muted-foreground">
              No seat-based upsells hiding basic features. No fifteen-step onboarding wizard.
            </p>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title}>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / checklist */}
      <section className="py-20">
        <div className="mx-auto grid max-w-5xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built like software a company would actually run
            </h2>
            <p className="mt-4 text-muted-foreground">
              Not a demo that resets on refresh. Deskly persists to a real database, validates on
              both the client and the server, and keeps a paper trail of every change.
            </p>
            <ul className="mt-6 space-y-3">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-xl border bg-card shadow-lg">
            <Image
              src="/screenshots/tickets.png"
              alt="Deskly ticket list with search, status and priority filters, and pagination"
              width={2400}
              height={1500}
              sizes="(max-width: 1024px) 100vw, 512px"
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Set up your workspace in under a minute
          </h2>
          <p className="mt-4 text-muted-foreground">
            No credit card. No sales call. Just a working helpdesk.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/register">
                Create your workspace
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

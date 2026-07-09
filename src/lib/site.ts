/**
 * Central product metadata. Single source of truth for name, copy, and URLs so
 * the layout, SEO metadata, OG image, sitemap, and marketing pages never drift.
 */
export const siteConfig = {
  name: "Deskly",
  tagline: "The support desk your team will actually enjoy",
  description:
    "Deskly is a modern helpdesk for lean support teams — triage, assign, and resolve customer tickets with real analytics, role-based access, and keyboard-fast UX.",
  url: process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000",
  ogImagePath: "/opengraph-image",
  locale: "en_US",
  keywords: [
    "helpdesk",
    "customer support software",
    "ticketing system",
    "support desk",
    "shared inbox",
    "SLA tracking",
    "support analytics",
  ],
  author: "Deskly",
  links: {
    github: "https://github.com/your-username/deskly",
  },
} as const;

export type SiteConfig = typeof siteConfig;

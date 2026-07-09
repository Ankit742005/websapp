import { redirect } from "next/navigation";

/**
 * Root page — redirects to the dashboard. A real marketing landing page with
 * value prop, features, screenshots, and CTA is built in M9.
 */
export default function Home() {
  redirect("/dashboard");
}

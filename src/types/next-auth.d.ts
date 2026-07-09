import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/constants/enums";

/**
 * Extend Auth.js session/JWT with the fields RBAC and tenancy depend on. These
 * are populated in the `jwt`/`session` callbacks in `src/auth.ts`.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      orgId?: string;
      /** ISO timestamp of email verification, or null. (`emailVerified` on the
       *  adapter user is a Date; this avoids the type collision.) */
      verified: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
    orgId?: string | null;
  }
}

// Auth.js v5 declares the JWT interface in `@auth/core/jwt`.
declare module "@auth/core/jwt" {
  interface JWT {
    uid?: string;
    role?: Role;
    orgId?: string;
    verified?: string | null;
  }
}

import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/db";
import { env } from "@/env";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/validations/auth";
import type { Role } from "@/lib/constants/enums";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (raw) => {
      const parsed = loginSchema.safeParse(raw);
      if (!parsed.success) return null;

      const { email, password } = parsed.data;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role as Role,
        orgId: user.orgId,
      };
    },
  }),
];

// OAuth providers light up only when their credentials are configured.
if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}
if (env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login", error: "/login" },
  providers,
  callbacks: {
    jwt: async ({ token, user, trigger }) => {
      if (user?.id) token.uid = user.id;

      // Load role/org/verification once at sign-in, and again on explicit
      // update() calls. Cached in the token thereafter to avoid a DB hit
      // on every request.
      const needsRefresh = Boolean(user) || trigger === "update" || token.role === undefined;
      if (token.uid && needsRefresh) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.uid },
          select: {
            role: true,
            orgId: true,
            emailVerified: true,
            name: true,
            image: true,
          },
        });
        if (dbUser) {
          token.role = dbUser.role as Role;
          token.orgId = dbUser.orgId ?? undefined;
          token.verified = dbUser.emailVerified
            ? dbUser.emailVerified.toISOString()
            : null;
          token.name = dbUser.name;
          token.picture = dbUser.image ?? null;
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.uid) {
        session.user.id = token.uid;
        session.user.role = token.role ?? "AGENT";
        session.user.orgId = token.orgId;
        session.user.verified = token.verified ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

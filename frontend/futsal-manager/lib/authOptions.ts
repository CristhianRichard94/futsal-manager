import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

import { UserRole } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.log(
    "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables"
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Only runs with `account`/`profile` populated on the initial sign-in.
      if (account && profile) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/sync`, {
            google_id: account.providerAccountId,
            email: profile.email,
            name: profile.name,
            avatar_url: (profile as { picture?: string }).picture ?? null,
          });
          token.role = data.role as UserRole;
          token.backendUserId = data.id as number;
        } catch (error) {
          console.error("Failed to sync user with backend on sign-in", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole | undefined;
        session.user.id = token.backendUserId as number | undefined;
      }
      return session;
    },
  },
};

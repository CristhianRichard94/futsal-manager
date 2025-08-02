
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";


if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.log("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables");
}
const handlers = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  });

export { handlers as GET, handlers as POST };
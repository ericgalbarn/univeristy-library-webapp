import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth, { User } from "next-auth";
import { compare } from "bcryptjs";
import { db } from "./db/db";
import { qrLoginSessions, users } from "./db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Special case for QR code login (no password needed)
        if (credentials?.qrLogin && credentials?.email) {
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email.toString()))
            .limit(1);

          if (user.length === 0) {
            return null;
          }

          // Check if user status is APPROVED
          if (user[0].status !== "APPROVED" && user[0].role !== "ADMIN") {
            if (user[0].status === "PENDING") {
              throw new Error(
                "Your account is pending approval. Please wait for admin verification."
              );
            } else if (user[0].status === "REJECTED") {
              throw new Error(
                "Your account registration has been rejected. Please contact support."
              );
            } else {
              throw new Error("Account access denied. Please contact support.");
            }
          }

          return {
            id: user[0].id.toString(),
            email: user[0].email,
            name: user[0].fullName,
          } as User;
        }

        // Regular credential login
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email.toString()))
          .limit(1);

        if (user.length === 0) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password.toString(),
          user[0].password
        );

        if (!isPasswordValid) return null;

        // Check if user status is APPROVED
        if (user[0].status !== "APPROVED" && user[0].role !== "ADMIN") {
          if (user[0].status === "PENDING") {
            throw new Error(
              "Your account is pending approval. Please wait for admin verification."
            );
          } else if (user[0].status === "REJECTED") {
            throw new Error(
              "Your account registration has been rejected. Please contact support."
            );
          } else {
            throw new Error("Account access denied. Please contact support.");
          }
        }

        return {
          id: user[0].id.toString(),
          email: user[0].email,
          name: user[0].fullName,
        } as User;
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }

      return session;
    },
  },
});

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
        console.log("🔐 Authorization attempt:", {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          isQRLogin: !!credentials?.qrLogin,
        });

        // Special case for QR code login (no password needed)
        if (credentials?.qrLogin && credentials?.email) {
          console.log("🔍 QR Login - searching for user...");
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email.toString()))
            .limit(1);

          console.log("🔍 QR Login - user found:", user.length > 0);
          if (user.length === 0) {
            console.log("❌ QR Login - no user found");
            return null;
          }

          console.log(
            "🔍 QR Login - user status:",
            user[0].status,
            "role:",
            user[0].role
          );

          // Check if user status is APPROVED
          if (user[0].status !== "APPROVED" && user[0].role !== "ADMIN") {
            if (user[0].status === "PENDING") {
              console.log("❌ QR Login - account pending");
              throw new Error(
                "Your account is pending approval. Please wait for admin verification."
              );
            } else if (user[0].status === "REJECTED") {
              console.log("❌ QR Login - account rejected");
              throw new Error(
                "Your account registration has been rejected. Please contact support."
              );
            } else {
              console.log("❌ QR Login - access denied");
              throw new Error("Account access denied. Please contact support.");
            }
          }

          console.log("✅ QR Login - success");
          return {
            id: user[0].id.toString(),
            email: user[0].email,
            name: user[0].fullName,
          } as User;
        }

        // Regular credential login
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Regular login - missing credentials");
          return null;
        }

        console.log("🔍 Regular login - searching for user...");
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email.toString()))
          .limit(1);

        console.log("🔍 Regular login - user found:", user.length > 0);
        if (user.length === 0) {
          console.log("❌ Regular login - no user found");
          return null;
        }

        console.log("🔍 Regular login - checking password...");
        const isPasswordValid = await compare(
          credentials.password.toString(),
          user[0].password
        );

        console.log("🔍 Regular login - password valid:", isPasswordValid);
        if (!isPasswordValid) {
          console.log("❌ Regular login - invalid password");
          return null;
        }

        console.log(
          "🔍 Regular login - user status:",
          user[0].status,
          "role:",
          user[0].role
        );

        // Check if user status is APPROVED
        if (user[0].status !== "APPROVED" && user[0].role !== "ADMIN") {
          if (user[0].status === "PENDING") {
            console.log("❌ Regular login - account pending");
            throw new Error(
              "Your account is pending approval. Please wait for admin verification."
            );
          } else if (user[0].status === "REJECTED") {
            console.log("❌ Regular login - account rejected");
            throw new Error(
              "Your account registration has been rejected. Please contact support."
            );
          } else {
            console.log("❌ Regular login - access denied");
            throw new Error("Account access denied. Please contact support.");
          }
        }

        console.log("✅ Regular login - success");
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

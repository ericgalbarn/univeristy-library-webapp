import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";
import "@/styles/admin.css";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import LoadingWrapper from "@/components/LoadingWrapper";

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (!session?.user?.id) redirect("/sign-in");

  const isAdmin = await db
    .select({ isAdmin: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)
    .then((res) => res[0]?.isAdmin === "ADMIN");

  if (!isAdmin) redirect("/");

  return (
    <LoadingWrapper>
      <main className="flex min-h-screen w-full flex-row">
        <Sidebar session={session} />

        <div className="admin-container">
          <Header session={session} />
          {children}
        </div>
      </main>
    </LoadingWrapper>
  );
};

export default Layout;

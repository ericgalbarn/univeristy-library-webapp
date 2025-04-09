import { auth } from "@/auth";
import Header from "@/components/Header";
import { BorrowCartProvider } from "@/lib/BorrowCartContext";
import { db } from "@/db/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { after } from "next/server";
import React, { ReactNode } from "react";

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  after(async () => {
    if (!session?.user?.id) return;

    // Get the user and see if the last activity date is today
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session?.user?.id))
      .limit(1);

    if (user[0].lastActivityDate === new Date().toISOString().slice(0, 10))
      return;

    await db
      .update(users)
      .set({ lastActivityDate: new Date().toISOString().slice(0, 10) })
      .where(eq(users.id, session?.user?.id));
  });

  return (
    <BorrowCartProvider>
      <main className="root-container">
        <div className="mx-auto max-w-7xl w-full my-10">
          <Header session={session} />
        </div>
        <div className="mt-10 pb-20">{children}</div>
      </main>
    </BorrowCartProvider>
  );
};

export default Layout;

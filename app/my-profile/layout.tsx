import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoadingWrapper from "@/components/LoadingWrapper";
import { BorrowCartProvider } from "@/lib/BorrowCartContext";
import Header from "@/components/Header";

export default async function MyProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <BorrowCartProvider>
      <LoadingWrapper>
        <main className="root-container">
          <div className="mx-auto max-w-7xl w-full my-10">
            <Header session={session} />
          </div>
          <div className="mt-10 pb-20">{children}</div>
        </main>
      </LoadingWrapper>
    </BorrowCartProvider>
  );
}

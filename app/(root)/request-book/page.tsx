import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BookRequestForm from "@/components/BookRequestForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const RequestBookPage = async () => {
  const session = await auth();

  // Redirect if not logged in
  if (!session) {
    redirect("/sign-in?callbackUrl=/request-book");
  }

  return (
    <div className="min-h-screen bg-light-300 text-dark-400 rounded-xl">
      <div className="container mx-auto py-8 px-4 xs:px-10 md:px-16 flex flex-col items-center ">
        <Button
          asChild
          className="mb-10 w-fit border border-light-300 bg-white text-xs font-medium text-dark-200 hover:bg-light-300"
        >
          <Link href="/browse-library">Back to Library</Link>
        </Button>

        <h1 className="text-3xl font-bold mb-6 text-dark-400">
          Request a New Book
        </h1>
        <p className="text-light-500 mb-8 max-w-2xl">
          Fill out this form to suggest a book for our library. Your request
          will be reviewed by our librarians, and if approved, the book will be
          added to our collection.
        </p>

        <section className="w-full max-w-2xl">
          <BookRequestForm />
        </section>
      </div>
    </div>
  );
};

export default RequestBookPage;

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BookForm from "@/components/admin/forms/BookForm";
import { useParams } from "next/navigation";

const EditBookPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch book data once when component mounts
  useEffect(() => {
    const fetchBookData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/books/${id}`);
        const data = await response.json();

        if (data.success) {
          setBook(data.book);
        } else {
          setError(data.error || "Failed to fetch book details");
          console.error("Error fetching book details:", data.error);
        }
      } catch (err) {
        console.error("Error fetching book:", err);
        setError("An unexpected error occurred while fetching book data");
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
  }, [id]); // Only depend on id

  // Function to retry fetching data (not in useCallback to avoid dependency issues)
  const retryFetchData = () => {
    setLoading(true);
    setError(null);

    fetch(`/api/admin/books/${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setBook(data.book);
        } else {
          setError(data.error || "Failed to fetch book details");
        }
      })
      .catch((err) => {
        console.error("Error fetching book:", err);
        setError("An unexpected error occurred while fetching book data");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <Button asChild className="back-btn">
        <Link href="/admin/books">Go Back</Link>
      </Button>

      <section className="w-full max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Edit Book</h1>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-admin"></div>
              <p className="mt-4 text-sm text-gray-500">Loading book data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-6 text-center">
            <h3 className="text-lg font-medium text-red-800">
              Error loading book
            </h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <Button className="mt-4" variant="outline" onClick={retryFetchData}>
              Try Again
            </Button>
          </div>
        ) : book ? (
          <BookForm
            type="update"
            bookId={book.id}
            title={book.title}
            author={book.author}
            genre={book.genre}
            description={book.description}
            rating={Number(book.rating)}
            totalCopies={Number(book.totalCopies)}
            coverUrl={book.coverUrl}
            coverColor={book.coverColor}
            videoUrl={book.videoUrl}
            summary={book.summary}
          />
        ) : (
          <div className="rounded-md bg-yellow-50 p-6 text-center">
            <h3 className="text-lg font-medium text-yellow-800">
              Book not found
            </h3>
            <p className="mt-2 text-sm text-yellow-700">
              Could not find the requested book.
            </p>
            <Button className="mt-4" variant="outline" asChild>
              <Link href="/admin/books">Return to Books</Link>
            </Button>
          </div>
        )}
      </section>
    </>
  );
};

export default EditBookPage;

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import config from "@/lib/config";

type BookRowProps = {
  book: Book;
  onBookUpdated: () => void;
};

const BookRow = ({ book, onBookUpdated }: BookRowProps) => {
  return (
    <div className="grid grid-cols-6 gap-4 border-b border-gray-200 p-4 hover:bg-gray-50">
      <div className="col-span-2 flex items-center gap-3">
        <div
          className="h-14 w-10 overflow-hidden rounded-sm"
          style={{ backgroundColor: book.coverColor }}
        >
          {book.coverUrl && (
            <Image
              src={`${config.env.imagekit.urlEndpoint}${book.coverUrl}`}
              alt={book.title}
              width={48}
              height={64}
              className="h-full w-full rounded-sm object-cover"
              priority
            />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{book.title}</p>
          <p className="text-sm text-gray-500">{book.author}</p>
        </div>
      </div>

      <div className="flex items-center">
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          {book.genre}
        </span>
      </div>

      <div className="flex items-center">
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={`h-4 w-4 ${
                index < book.rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center">
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {book.availableCopies}/{book.totalCopies}
          </span>
          <div className="mt-1 h-1.5 w-24 rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-green-500"
              style={{
                width: `${(book.availableCopies / book.totalCopies) * 100}%`,
                backgroundColor:
                  book.availableCopies === 0
                    ? "#ef4444"
                    : book.availableCopies < book.totalCopies / 3
                      ? "#f97316"
                      : "#22c55e",
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          className="h-8 w-8 rounded-full bg-transparent p-0 hover:bg-gray-100"
          title="View Book Details"
          asChild
        >
          <Link href={`/admin/books/${book.id}`}>
            <Image
              src="/icons/admin/book.svg"
              alt="view"
              width={16}
              height={16}
            />
          </Link>
        </Button>

        <Button
          className="h-8 w-8 rounded-full bg-transparent p-0 hover:bg-gray-100"
          title="Edit Book"
          asChild
        >
          <Link href={`/admin/books/${book.id}/edit`}>
            <Image
              src="/icons/admin/edit.svg"
              alt="edit"
              width={16}
              height={16}
            />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default BookRow;

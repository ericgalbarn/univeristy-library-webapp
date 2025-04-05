import React from "react";
import BookCard from "./BookCard";

interface Props {
  title: string;
  books: Book[];
  containerClassName?: string;
  showDueDate?: boolean;
}

const BookList = ({
  title,
  books,
  containerClassName,
  showDueDate = false,
}: Props) => {
  if (books.length < 1) return null;

  return (
    <section className={containerClassName}>
      {title && (
        <h2 className="font-bebas-neue text-4xl text-light-100">{title}</h2>
      )}

      <ul className="book-list">
        {books.map((book) => (
          <BookCard
            key={book.id}
            {...book}
            showDueDate={showDueDate}
            dueDate={showDueDate ? (book as any).dueDate : undefined}
            daysUntilDue={showDueDate ? (book as any).daysUntilDue : undefined}
            isOverdue={showDueDate ? (book as any).isOverdue : undefined}
          />
        ))}
      </ul>
    </section>
  );
};

export default BookList;

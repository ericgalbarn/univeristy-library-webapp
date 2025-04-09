import { auth } from "@/auth";
import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";
import { Button } from "@/components/ui/button";
import { db } from "@/db/db";
import { books, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

const Home = async () => {
  const session = await auth();
  const userId = session?.user?.id || "";

  try {
    // Fetch latest books with proper error handling
    const latestBooks = (await db
      .select()
      .from(books)
      .orderBy(desc(books.createdAt))
      .limit(10)) as Book[];

    // Check if we have any books
    if (!latestBooks || latestBooks.length === 0) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <h2 className="text-2xl font-bold">No books available yet</h2>
          <p className="mt-2 text-gray-500">
            Check back later for new additions to our library.
          </p>
        </div>
      );
    }

    // Get featured book (first book)
    const featuredBook = latestBooks[0];

    // Get remaining books for the list
    const remainingBooks = latestBooks.slice(1);

    // Default borrowing eligibility
    let borrowingEligibility = {
      isEligible: false,
      message: "You need to log in to borrow books",
    };

    // Fetch user data and determine eligibility if user is logged in
    if (userId) {
      try {
        const userData = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        const user = userData.length > 0 ? userData[0] : null;

        if (user) {
          borrowingEligibility = {
            isEligible:
              featuredBook.availableCopies > 0 && user.status === "APPROVED",
            message:
              featuredBook.availableCopies <= 0
                ? "Book is not available"
                : user.status !== "APPROVED"
                  ? "Your account is not approved for borrowing yet"
                  : "You are eligible to borrow this book",
          };
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    return (
      <>
        {/* Display featured book in BookOverview */}
        <BookOverview
          {...featuredBook}
          userId={userId}
          borrowingEligibility={borrowingEligibility}
        />

        {/* Display remaining books in BookList */}
        {remainingBooks.length > 0 && (
          <BookList
            title="Latest Books"
            books={remainingBooks}
            containerClassName="mt-28"
          />
        )}
      </>
    );
  } catch (error) {
    console.error("Error fetching books:", error);

    // Display error state
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="mt-2 text-gray-500">
          We couldn't load the books. Please try again later.
        </p>
      </div>
    );
  }
};

export default Home;

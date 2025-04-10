"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { bookSchema } from "@/lib/validation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import ColorPicker from "../ColorPicker";
import { createBook, updateBook } from "@/lib/admin/actions/book";
import { toast } from "@/hooks/use-toast";
import { isYouTubeUrl } from "@/lib/utils";

interface Props extends Partial<Book> {
  type?: "create" | "update";
  bookId?: string;
}

const BookForm = ({ type = "create", bookId, ...bookData }: Props) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof bookSchema>>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      description: "",
      author: "",
      genre: "",
      rating: 1,
      totalCopies: 1,
      coverUrl: "",
      coverColor: "",
      videoUrl: "",
      summary: "",
    },
  });

  // Set form values if in edit mode
  useEffect(() => {
    if (type === "update" && bookData) {
      // Ensure numbers are properly converted
      const rating = typeof bookData.rating === "number" ? bookData.rating : 1;
      const totalCopies =
        typeof bookData.totalCopies === "number" ? bookData.totalCopies : 1;

      form.reset({
        title: bookData.title || "",
        description: bookData.description || "",
        author: bookData.author || "",
        genre: bookData.genre || "",
        rating: rating,
        totalCopies: totalCopies,
        coverUrl: bookData.coverUrl || "",
        coverColor: bookData.coverColor || "",
        videoUrl: bookData.videoUrl || "",
        summary: bookData.summary || "",
      });
    }
  }, [form, type, bookId]);

  const onSubmit = async (values: z.infer<typeof bookSchema>) => {
    setIsSubmitting(true);
    try {
      if (type === "create") {
        const result = await createBook(values);
        if (result.success) {
          toast({
            title: "Success",
            description: "Book created successfully.",
          });

          router.push(`/admin/books`);
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }
      } else if (type === "update" && bookId) {
        const result = await updateBook(bookId, values);
        if (result.success) {
          toast({
            title: "Success",
            description: "Book updated successfully.",
          });

          router.push(`/admin/books`);
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-normal text-dark-500">
                Book Title
              </FormLabel>
              <FormControl>
                <Input
                  required
                  placeholder="Book title"
                  {...field}
                  className="book-form_input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-normal text-dark-500">
                Author
              </FormLabel>
              <FormControl>
                <Input
                  required
                  placeholder="Book author"
                  {...field}
                  className="book-form_input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-normal text-dark-500">
                Genre
              </FormLabel>
              <FormControl>
                <Input
                  required
                  placeholder="Book genre"
                  {...field}
                  className="book-form_input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-normal text-dark-500">
                Rating
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  placeholder="Book rating"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value}
                  className="book-form_input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="totalCopies"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-normal text-dark-500">
                Total Copies
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={10000}
                  placeholder="Total Copies"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value}
                  className="book-form_input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="coverUrl"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-normal text-dark-500">
                Book Image
              </FormLabel>
              <FormControl>
                <FileUpload
                  type="image"
                  accept="image/*"
                  placeholder="Upload a book image"
                  folder="books/covers"
                  variant="light"
                  onFileChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="coverColor"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-normal text-dark-500">
                Primary Color
              </FormLabel>
              <FormControl>
                <ColorPicker
                  onPickerChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-normal text-dark-500">
                Book Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Book description"
                  {...field}
                  rows={10}
                  className="book-form_input min-h-[200px]"
                  maxLength={undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-normal text-dark-500">
                Book Trailer Video
              </FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex flex-col">
                    <Input
                      placeholder="Paste YouTube URL (e.g., https://www.youtube.com/watch?v=xyz123)"
                      className="book-form_input"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Upload your video to YouTube and paste the URL here
                      (recommended)
                    </p>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="mx-4 text-sm text-gray-500">OR</span>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>

                  <div>
                    <FileUpload
                      type="video"
                      accept="video/*"
                      placeholder="Upload book trailer directly"
                      folder="books/trailers"
                      variant="light"
                      onFileChange={(value) => {
                        if (field.value && isYouTubeUrl(field.value)) {
                          // Ask user if they want to replace YouTube URL
                          if (
                            confirm("Replace YouTube URL with direct upload?")
                          ) {
                            field.onChange(value);
                          }
                        } else {
                          field.onChange(value);
                        }
                      }}
                      value={
                        !field.value || isYouTubeUrl(field.value)
                          ? ""
                          : field.value
                      }
                    />
                    <p className="text-amber-500 text-xs mt-1">
                      Note: Video processing is limited and may not be available
                      due to quota restrictions. We recommend using YouTube
                      instead.
                    </p>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-normal text-dark-500">
                Book Summary
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Book summary"
                  {...field}
                  rows={5}
                  className="book-form_input min-h-[150px]"
                  maxLength={undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="book-form_btn text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              {type === "create" ? "Adding Book..." : "Updating Book..."}
            </span>
          ) : type === "create" ? (
            "Add Book to Library"
          ) : (
            "Update Book"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default BookForm;

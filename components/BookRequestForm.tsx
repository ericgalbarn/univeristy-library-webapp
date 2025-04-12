"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
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
import { bookSchema, genreArrayToString } from "@/lib/validation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import { useToast } from "./ui/use-toast";
import ColorPicker from "./ColorPicker";
import { isYouTubeUrl } from "@/lib/utils";
import { X } from "lucide-react";

const BookRequestForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [genreInput, setGenreInput] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

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
      coverColor: "#3B82F6", // Default blue color
      videoUrl: "",
      summary: "",
    },
  });

  const addGenre = () => {
    const trimmedGenre = genreInput.trim();
    if (trimmedGenre && !selectedGenres.includes(trimmedGenre)) {
      const newGenres = [...selectedGenres, trimmedGenre];
      setSelectedGenres(newGenres);
      form.setValue("genre", genreArrayToString(newGenres));
      setGenreInput("");
    }
  };

  const removeGenre = (genre: string) => {
    const newGenres = selectedGenres.filter((g) => g !== genre);
    setSelectedGenres(newGenres);
    form.setValue("genre", genreArrayToString(newGenres));
  };

  const handleGenreKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addGenre();
    }
  };

  const onSubmit = async (values: z.infer<typeof bookSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/book-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          availableCopies: values.totalCopies, // Set available copies to match total copies initially
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description:
            "Book request submitted successfully. It will be reviewed by an admin.",
        });

        // Reset form
        form.reset();
        setSelectedGenres([]);

        // Redirect to user's book requests page
        router.push("/my-profile/book-requests");
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit book request",
          variant: "destructive",
        });
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
                Genres
              </FormLabel>
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedGenres.map((genre) => (
                    <div
                      key={genre}
                      className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1"
                    >
                      <span className="mr-1">{genre}</span>
                      <button
                        type="button"
                        onClick={() => removeGenre(genre)}
                        className="text-primary hover:text-primary/80"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <Input
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    onKeyDown={handleGenreKeyDown}
                    placeholder="Add genre (comma or enter to add)"
                    className="book-form_input"
                  />
                  <Button
                    type="button"
                    onClick={addGenre}
                    className="ml-2"
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                <input type="hidden" {...field} />
                <p className="text-xs text-gray-500 mt-1">
                  Add multiple genres by typing and pressing Enter or comma
                </p>
              </div>
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
                Suggested Number of Copies
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
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
          name="description"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-normal text-dark-500">
                Book Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter book description"
                  className="book-form_input min-h-[150px]"
                  {...field}
                  maxLength={undefined}
                />
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
                Brief Summary
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter book summary"
                  className="book-form_input min-h-[150px]"
                  {...field}
                  maxLength={undefined}
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
                <div className="book-form_input p-0 overflow-hidden">
                  <FileUpload
                    type="image"
                    accept="image/*"
                    placeholder="Upload a book image"
                    folder="/book-covers"
                    variant="light"
                    onFileChange={field.onChange}
                    value={field.value}
                  />
                </div>
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
                  value={field.value}
                  onPickerChange={field.onChange}
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
                Book Trailer
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
                    </p>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-1 border-t border-dark-400"></div>
                    <span className="mx-4 text-sm text-gray-500">OR</span>
                    <div className="flex-1 border-t border-dark-400"></div>
                  </div>

                  <div>
                    <FileUpload
                      type="video"
                      accept="video/*"
                      placeholder="Upload book trailer directly"
                      folder="/book-trailers"
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
        <Button
          type="submit"
          disabled={isSubmitting}
          className="book-form_btn text-white"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </form>
    </Form>
  );
};

export default BookRequestForm;

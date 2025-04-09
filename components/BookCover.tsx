"use client";

import { cn } from "@/lib/utils";
import React from "react";
import BookCoverSvg from "./BookCoverSvg";
import { IKImage } from "imagekitio-next";
import config from "@/lib/config";

type BookCoverVariant = "extraSmall" | "small" | "medium" | "regular" | "wide";

const variantStyles: Record<BookCoverVariant, string> = {
  extraSmall: "book-cover_extra_small",
  small: "book-cover_small",
  medium: "book-cover_medium",
  regular: "book-cover_regular",
  wide: "book-cover_wide",
};
interface Props {
  className?: string;
  variant?: BookCoverVariant;
  coverColor: string;
  coverImage: string;
}

const BookCover = ({
  className,
  variant = "regular",
  coverColor = "#012B48",
  coverImage = "https://placehold.co/400x600.png",
}: Props) => {
  return (
    <div
      className={cn(
        "relative transition-all duration-500 group",
        variantStyles[variant],
        className
      )}
    >
      <div
        className="absolute inset-0 bg-primary/10 opacity-0 rounded-sm blur-lg group-hover:opacity-30 transition-all duration-500 ease-in-out"
        style={{
          backgroundColor: `${coverColor}30`,
          transform: "translateY(10%) scale(0.95)",
        }}
      />
      <BookCoverSvg coverColor={coverColor} />
      <div
        className="absolute z-10"
        style={{ left: "12%", width: "87.5%", height: "88%" }}
      >
        <div
          className="absolute inset-0 w-full h-full"
          style={{ backgroundColor: coverColor }}
        />
        <IKImage
          path={coverImage}
          urlEndpoint={config.env.imagekit.urlEndpoint}
          alt="Book Cover"
          fill
          className="rounded-sm object-fill transition-transform duration-700 ease-out group-hover:scale-[1.01]"
          loading="lazy"
          lqip={{ active: true }}
        />
      </div>
    </div>
  );
};

export default BookCover;

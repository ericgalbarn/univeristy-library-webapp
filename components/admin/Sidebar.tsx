"use client";
import { adminSideBarLinks } from "@/constants";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";

const Sidebar = ({ session }: { session: Session }) => {
  const pathname = usePathname();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [prevPath, setPrevPath] = useState(pathname);
  const [animateIndicator, setAnimateIndicator] = useState(false);

  // Detect route changes to trigger animation
  useEffect(() => {
    if (prevPath !== pathname) {
      setAnimateIndicator(true);
      setPrevPath(pathname);

      // Reset animation flag after animation completes with shorter duration
      const timer = setTimeout(() => {
        setAnimateIndicator(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [pathname, prevPath]);

  return (
    <div className="admin-sidebar">
      <div>
        <Link href="/admin" className="block">
          <div className="logo">
            <Image
              src="/icons/admin/logo.svg"
              alt="logo"
              height={37}
              width={37}
              className="transition-transform duration-300 hover:scale-110"
            />
            <h1>Bookaholic</h1>
          </div>
        </Link>

        <div className="mt-10 flex flex-col gap-5">
          {adminSideBarLinks.map((link) => {
            const isSelected =
              (link.route !== "/admin" &&
                pathname.includes(link.route) &&
                link.route.length > 1) ||
              pathname === link.route;
            const isHovered = hoveredLink === link.route;

            return (
              <Link
                href={link.route}
                key={link.route}
                onMouseEnter={() => setHoveredLink(link.route)}
                onMouseLeave={() => setHoveredLink(null)}
                className="relative"
              >
                <div
                  className={cn(
                    "link relative",
                    isHovered && !isSelected && "bg-light-300/50"
                  )}
                >
                  <div className="relative size-5 z-10">
                    <Image
                      src={link.img}
                      alt="icon"
                      fill
                      className={cn(
                        "object-contain transition-all duration-300",
                        isSelected && "brightness-0 filter saturate-200",
                        isHovered && !isSelected && "transform scale-110"
                      )}
                    />
                  </div>

                  <p
                    className={cn(
                      "transition-all duration-300",
                      isSelected
                        ? "text-primary-admin font-semibold"
                        : "text-dark",
                      isHovered && !isSelected && "text-primary-admin/80"
                    )}
                  >
                    {link.text}
                  </p>
                </div>

                {/* Simpler active indicator with animation */}
                <div
                  className={cn(
                    "absolute left-0 top-0 h-full w-1.5 bg-primary-admin rounded-r",
                    isSelected ? "opacity-100" : "opacity-0",
                    isSelected && animateIndicator
                      ? "animate-indicator-stretch"
                      : "transition-all duration-300 ease-in-out"
                  )}
                ></div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="user hover:shadow-md transition-shadow duration-300">
        <Avatar>
          <AvatarFallback className="bg-amber-100">
            {getInitials(session?.user?.name || "IN")}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col max-md:hidden">
          <p className="font-semibold text-dark-100">{session?.user?.name}</p>
          <p className="text-light-500 text-xs">{session?.user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

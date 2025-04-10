"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Session } from "next-auth";
import {
  BookOpen,
  Heart,
  ShoppingCart,
  PlusCircle,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";
import { useBorrowCart } from "@/lib/BorrowCartContext";
import { logoutAction } from "@/lib/actions/auth-actions";
import { useState, useEffect } from "react";

const Header = ({ session }: { session: Session }) => {
  const userName = session?.user?.name || "User";
  const userInitials = getInitials(userName);
  const { cartCount } = useBorrowCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle resize detection
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Check on initial load
    checkIfMobile();

    // Set up event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Clean up event listener
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Handle body scroll locking when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <header className="flex flex-wrap items-center justify-between w-full relative">
      {/* Logo */}
      <Link href="/">
        <div className="flex items-center gap-2">
          <Image src="/icons/logo.svg" alt="logo" height={40} width={40} />
          <h1 className="text-2xl font-semibold text-primary">Bookaholic</h1>
        </div>
      </Link>

      {/* Mobile Menu Button */}
      {isMobile && (
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            aria-label="Toggle menu"
            className="text-white hover:text-black transition-colors duration-200"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      )}

      {/* Desktop Navigation */}
      {!isMobile && (
        <div className="flex items-center gap-4">
          <Link href="/browse-library">
            <Button variant="outline" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Browse Library
            </Button>
          </Link>

          <Link href="/request-book">
            <Button variant="outline" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Request Book
            </Button>
          </Link>

          <Link href="/my-profile/book-requests">
            <Button variant="outline" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              My Requests
            </Button>
          </Link>

          <Link href="/favorites">
            <Button variant="outline" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Favorites
            </Button>
          </Link>

          <Link href="/borrow-cart">
            <Button
              variant="outline"
              className="flex items-center gap-2 relative"
            >
              <ShoppingCart className="h-4 w-4" />
              Borrow Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          <Link href="/my-profile">
            <Avatar>
              <AvatarFallback className="bg-amber-100">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Link>

          <form action={logoutAction}>
            <Button>Logout</Button>
          </form>
        </div>
      )}

      {/* Mobile Sidebar Navigation Backdrop */}
      {isMobile && (
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out ${isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Navigation */}
      {isMobile && (
        <div
          className={`fixed top-0 right-0 h-full w-3/4 max-w-xs bg-background shadow-xl z-50 p-6 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex flex-col flex-1 space-y-4">
              <Link
                href="/browse-library"
                className="w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button
                  variant="outline"
                  className="flex items-center gap-2 w-full justify-start"
                >
                  <BookOpen className="h-4 w-4" />
                  Browse Library
                </Button>
              </Link>

              <Link
                href="/request-book"
                className="w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button
                  variant="outline"
                  className="flex items-center gap-2 w-full justify-start"
                >
                  <PlusCircle className="h-4 w-4" />
                  Request Book
                </Button>
              </Link>

              <Link
                href="/my-profile/book-requests"
                className="w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button
                  variant="outline"
                  className="flex items-center gap-2 w-full justify-start"
                >
                  <ClipboardList className="h-4 w-4" />
                  My Requests
                </Button>
              </Link>

              <Link
                href="/favorites"
                className="w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button
                  variant="outline"
                  className="flex items-center gap-2 w-full justify-start"
                >
                  <Heart className="h-4 w-4" />
                  Favorites
                </Button>
              </Link>

              <Link
                href="/borrow-cart"
                className="w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button
                  variant="outline"
                  className="flex items-center gap-2 relative w-full justify-start"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Borrow Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>

            <div className="mt-auto pt-6 border-t flex justify-between items-center">
              <Link href="/my-profile" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-amber-100">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm font-medium">{userName}</div>
                </div>
              </Link>

              <form action={logoutAction}>
                <Button>Logout</Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Session } from "next-auth";
import { BookOpen, Heart, ShoppingCart } from "lucide-react";
import { useBorrowCart } from "@/lib/BorrowCartContext";
import { logoutAction } from "@/lib/actions/auth-actions";

const Header = ({ session }: { session: Session }) => {
  const userName = session?.user?.name || "User";
  const userInitials = getInitials(userName);
  const { cartCount } = useBorrowCart();

  return (
    <header className="flex items-center justify-between w-full">
      {/* Logo */}
      <Link href="/">
        <div className="flex items-center gap-2">
          <Image src="/icons/logo.svg" alt="logo" height={40} width={40} />
          <h1 className="text-2xl font-semibold text-primary">Bookaholic</h1>
        </div>
      </Link>

      {/* User section and logout */}
      <div className="flex items-center gap-4">
        <Link href="/browse-library">
          <Button variant="outline" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Browse Library
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
    </header>
  );
};

export default Header;

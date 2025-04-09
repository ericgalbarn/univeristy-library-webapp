import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Session } from "next-auth";
import { BookOpen, Heart } from "lucide-react";

const Header = ({ session }: { session: Session }) => {
  const userName = session?.user?.name || "User";
  const userInitials = getInitials(userName);

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

        <Link href="/my-profile">
          <Avatar>
            <AvatarFallback className="bg-amber-100">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Link>

        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <Button>Logout</Button>
        </form>
      </div>
    </header>
  );
};

export default Header;

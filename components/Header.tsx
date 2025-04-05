import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Session } from "next-auth";

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

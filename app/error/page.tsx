"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "An error occurred";

  useEffect(() => {
    // Close the window after 5 seconds
    const timer = setTimeout(() => {
      window.close();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-center">Login Failed</CardTitle>
          <CardDescription className="text-center">
            Unable to complete QR code login
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600">{message}</p>
          <p className="text-xs text-gray-400 mt-2">
            This window will close automatically in 5 seconds
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => window.close()}>
            Close Window
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

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
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

export default function QRSuccessPage() {
  useEffect(() => {
    // Close the window after 3 seconds
    const timer = setTimeout(() => {
      window.close();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-center">Login Successful!</CardTitle>
          <CardDescription className="text-center">
            You have been successfully authenticated
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600">
            You can now return to your desktop browser. This window will close
            automatically.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => window.close()}>Close Window</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

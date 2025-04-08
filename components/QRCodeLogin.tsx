"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { generateQRCode, checkQRVerificationStatus } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { toast } from "@/components/ui/use-toast";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type EmailFormValues = z.infer<typeof emailSchema>;

interface QRCodeLoginProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QRCodeLogin({ open, onOpenChange }: QRCodeLoginProps) {
  const [step, setStep] = useState<"email" | "qr">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(600); // 10 minutes in seconds
  const router = useRouter();

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  // Clean up polling when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Effect to handle countdown timer
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diffInSeconds = Math.floor(
        (expiry.getTime() - now.getTime()) / 1000
      );

      setRemainingTime(diffInSeconds > 0 ? diffInSeconds : 0);

      if (diffInSeconds <= 0) {
        clearInterval(interval);
        setError("QR code has expired. Please generate a new one.");
        setStep("email");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      setStep("email");
      setQrToken(null);
      setError(null);
      form.reset();
    }
  }, [open, form]);

  const pollForVerification = useCallback(
    async (token: string) => {
      // Stop any existing polling
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }

      // Start new polling interval
      const interval = setInterval(async () => {
        try {
          const result = await checkQRVerificationStatus(token);

          if (result.error) {
            clearInterval(interval);
            setError(result.error);
            return;
          }

          if (result.success) {
            clearInterval(interval);
            // Show success toast before redirecting
            toast({
              title: "Success",
              description: "QR code verified successfully. Redirecting...",
              duration: 2000,
            });
            // Wait for toast to show before redirecting
            setTimeout(() => {
              onOpenChange(false);
              router.push("/");
            }, 2000);
          }
        } catch (error) {
          console.error("Error checking QR verification status:", error);
        }
      }, 2000); // Poll every 2 seconds

      setPollingInterval(interval);
    },
    [pollingInterval, onOpenChange, router]
  );

  const onSubmit = async (data: EmailFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the correct endpoint path
      const apiUrl = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/auth/qr-code`;
      console.log("Environment:", process.env.NODE_ENV);
      console.log("API URL:", apiUrl);
      console.log("Request payload:", { email: data.email });

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include", // Add this to handle cookies if needed
        body: JSON.stringify({ email: data.email }),
      }).catch((error) => {
        console.error("Fetch error details:", error);
        throw new Error(`Network error: ${error.message}`);
      });

      if (!response) {
        throw new Error("No response received from server");
      }

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text:", errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Success response:", result);

      if (!result.token) {
        throw new Error("No token received from server");
      }

      setQrToken(result.token);
      setExpiresAt(new Date(result.expiresAt));
      setStep("qr");

      // Use the appropriate URL based on the environment
      const qrUrl =
        process.env.NODE_ENV === "production"
          ? `${process.env.NEXT_PUBLIC_PROD_API_ENDPOINT}/api/auth/qr-login/${result.token}`
          : `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/qr-login/${result.token}`;
      console.log("Generated QR URL:", qrUrl);
      setQrCodeUrl(qrUrl);

      // Start polling for verification
      pollForVerification(result.token);
    } catch (error) {
      console.error("Error generating QR code:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {step === "email" ? "Enter your email" : "Scan QR Code"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "email" ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating QR Code...
                  </>
                ) : (
                  "Generate QR Code"
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center p-4 bg-gray-100 rounded-lg">
              {qrToken ? (
                <div className="p-2 bg-white rounded">
                  <QRCode size={256} value={qrCodeUrl || ""} />
                </div>
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-white">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">
                Scan this QR code with your phone to sign in
              </p>
              {remainingTime > 0 && (
                <p className="text-xs text-gray-400">
                  Expires in {formatTime(remainingTime)}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setStep("email");
                if (pollingInterval) {
                  clearInterval(pollingInterval);
                  setPollingInterval(null);
                }
              }}
            >
              Back to email
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

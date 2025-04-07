"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const handleSendOTP = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "RESET_PASSWORD" }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("OTP has been sent to your email");
        setOtpSent(true);
        startResendCountdown();
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startResendCountdown = () => {
    setResendDisabled(true);
    setResendCountdown(60); // 60 seconds cooldown

    const interval = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast.error("Please enter the OTP sent to your email");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Password reset successfully");
        router.push("/sign-in");
      } else {
        toast.error(data.error || "Failed to reset password");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Reset your password</h1>
      <p className="text-light-100">
        Enter your email to receive a password reset code
      </p>

      {!otpSent ? (
        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              disabled={loading}
              className="form-input"
            />
          </div>

          <Button
            type="button"
            className="w-full form-btn"
            onClick={handleSendOTP}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Code"}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label htmlFor="otp" className="sr-only">
              OTP
            </label>
            <Input
              id="otp"
              name="otp"
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              disabled={loading}
              className="form-input"
            />
            <div className="mt-1 text-right">
              <button
                type="button"
                className={`text-sm ${
                  resendDisabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-primary hover:underline"
                }`}
                onClick={handleSendOTP}
                disabled={resendDisabled}
              >
                {resendDisabled
                  ? `Resend in ${resendCountdown}s`
                  : "Resend OTP"}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="sr-only">
              New Password
            </label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              disabled={loading}
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="sr-only">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={loading}
              className="form-input"
            />
          </div>

          <Button
            type="button"
            className="w-full form-btn"
            onClick={handleVerifyOTP}
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </div>
      )}

      <p className="text-center text-base font-medium">
        Remember your password?{" "}
        <Link href="/sign-in" className="font-bold text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
}

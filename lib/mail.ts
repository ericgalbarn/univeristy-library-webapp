import { Resend } from "resend";
import OTPEmail from "@/emails/otp-email";
import { render } from "@react-email/render";
import React from "react";

const resend = new Resend(process.env.RESEND_TOKEN);

export async function sendOTPEmail(to: string, otp: string) {
  try {
    console.log("Attempting to send OTP email to:", to);

    if (!process.env.RESEND_TOKEN) {
      console.error("RESEND_TOKEN is not set in environment variables");
      throw new Error("RESEND_TOKEN environment variable is not set");
    }

    // Generate email HTML using the same pattern as other emails
    const emailComponent = React.createElement(OTPEmail, { otp });
    const emailHtml = await render(emailComponent);

    console.log("Resend token is set, initializing email send");
    const result = await resend.emails.send({
      from: "University Library <contact@ericgalbarn.site>",
      to: [to],
      subject: "Your Password Reset OTP",
      html: emailHtml,
      text: "Please view this email in an HTML-compatible email client to see the full content.",
    });

    if (!result) {
      console.error("No result received from Resend API");
      throw new Error("Failed to send email: No response received");
    }

    console.log(
      "Email sent successfully with result:",
      JSON.stringify(result, null, 2)
    );
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    if (error instanceof Error) {
      console.error("Email error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    return { success: false, error };
  }
}

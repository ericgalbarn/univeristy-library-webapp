import { render } from "@react-email/render";
import WelcomeEmail from "../emails/WelcomeEmail";
import NonActiveEmail from "../emails/NonActiveEmail";
import WelcomeBackEmail from "../emails/WelcomeBackEmail";
import React from "react";

// Welcome Email
export async function generateWelcomeEmail({
  fullName,
  universityId,
}: {
  fullName: string;
  universityId?: string;
}): Promise<string> {
  // Use createElement instead of JSX
  const emailComponent = React.createElement(WelcomeEmail, {
    fullName,
    universityId,
  });
  return render(emailComponent);
}

// Non-Active Email
export async function generateNonActiveEmail({
  fullName,
}: {
  fullName: string;
}): Promise<string> {
  // Use createElement instead of JSX
  const emailComponent = React.createElement(NonActiveEmail, {
    fullName,
  });
  return render(emailComponent);
}

// Welcome Back Email
export async function generateWelcomeBackEmail({
  fullName,
}: {
  fullName: string;
}): Promise<string> {
  // Use createElement instead of JSX
  const emailComponent = React.createElement(WelcomeBackEmail, {
    fullName,
  });
  return render(emailComponent);
}

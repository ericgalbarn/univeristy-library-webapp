import { db } from "@/db/db";
import { users } from "@/db/schema";
import { sendEmail } from "@/lib/workflow";
import { serve } from "@upstash/workflow/nextjs";
import { eq } from "drizzle-orm";
import {
  generateWelcomeEmail,
  generateNonActiveEmail,
  generateWelcomeBackEmail,
} from "@/lib/emailTemplates";

type UserState = "non-active" | "active";

type InitialData = {
  email: string;
  fullName: string;
  universityId?: string;
};

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const THREE_DAYS_IN_MS = 3 * ONE_DAY_IN_MS;
const THIRTY_DAYS_IN_MS = 30 * ONE_DAY_IN_MS;

const getUserState = async (email: string): Promise<UserState> => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length === 0) {
    return "non-active";
  }

  const lastActivityDate = new Date(user[0].lastActivityDate!);
  const now = new Date();
  const timeDifference = now.getTime() - lastActivityDate.getTime();

  if (
    timeDifference > THIRTY_DAYS_IN_MS &&
    timeDifference <= THREE_DAYS_IN_MS
  ) {
    return "non-active";
  }

  return "active";
};

export const { POST } = serve<InitialData>(async (context) => {
  const { email, fullName, universityId } = context.requestPayload;

  // Welcome Email
  await context.run("new-signup", async () => {
    const welcomeEmail = await generateWelcomeEmail({ fullName, universityId });
    await sendEmail({
      email,
      subject: "Welcome to the University Library",
      message: welcomeEmail,
    });
  });

  await context.sleep("wait-for-3-days", 60 * 60 * 24 * 3);

  while (true) {
    const state = await context.run("check-user-state", async () => {
      return await getUserState(email);
    });

    if (state === "non-active") {
      await context.run("send-email-non-active", async () => {
        const nonActiveEmail = await generateNonActiveEmail({ fullName });
        await sendEmail({
          email,
          subject: "We Miss You at the University Library",
          message: nonActiveEmail,
        });
      });
    } else if (state === "active") {
      await context.run("send-email-active", async () => {
        const welcomeBackEmail = await generateWelcomeBackEmail({ fullName });
        await sendEmail({
          email,
          subject: "Welcome Back to the University Library",
          message: welcomeBackEmail,
        });
      });
    }

    await context.sleep("wait-for-1-month", 60 * 60 * 24 * 30);
  }
});

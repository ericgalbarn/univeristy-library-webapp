import { Client as WorkflowClient } from "@upstash/workflow";
import config from "./config";
import { Client as QstashClient, resend } from "@upstash/qstash";

export const workflowClient = new WorkflowClient({
  baseUrl: config.env.upstash.qstashUrl,
  token: config.env.upstash.qstashToken,
});

const qstashClient = new QstashClient({
  token: config.env.upstash.qstashToken,
});

export const sendEmail = async ({
  email,
  subject,
  message,
}: {
  email: string;
  subject: string;
  message: string;
}) => {
  console.log(
    "Sending email with HTML content:",
    message.substring(0, 150) + "..."
  ); // Log part of the message for debugging

  await qstashClient.publishJSON({
    api: {
      name: "email",
      provider: resend({ token: config.env.resendToken }),
    },
    body: {
      from: "University Library <contact@ericgalbarn.site>",
      to: [email],
      subject,
      html: message,
      text: "Please view this email in an HTML-compatible email client to see the full content.", // Fallback text
    },
  });
};

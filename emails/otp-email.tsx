import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OTPEmailProps {
  otp: string;
}

export default function OTPEmail({ otp }: OTPEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your OTP for University Library account</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif" }}>
        <Container>
          <Heading>Password Reset OTP</Heading>
          <Section>
            <Text>
              Please use the following OTP to reset your password. This code
              will expire in 10 minutes.
            </Text>
            <Text
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                letterSpacing: "4px",
                backgroundColor: "#f0f0f0",
                padding: "10px 20px",
                borderRadius: "4px",
                display: "inline-block",
              }}
            >
              {otp}
            </Text>
            <Text>
              If you did not request this password reset, please ignore this
              email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

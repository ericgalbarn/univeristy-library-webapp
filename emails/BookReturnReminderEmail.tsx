import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Hr,
  Row,
  Column,
} from "@react-email/components";
import config from "@/lib/config";
import { safeBase64Encode } from "@/lib/utils";

interface BookReturnReminderEmailProps {
  fullName: string;
  bookTitle: string;
  dueDate: string;
  daysRemaining: number;
  borrowId: string;
}

const baseUrl = config.env.prodApiEndpoint || "https://university-library.com";
const LOGO_SVG = `
<svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.5" d="M20 9.99988V31.8888C29.8889 26.4443 38.2223 29.9999 40 31.9999V9.99987C33 5.99986 21.8148 6.62951 20 9.99988Z" fill="#DBE5FF"/>
<path d="M20 10.0001V31.889C26.3333 23.6668 34.3334 25.6668 36.8889 26.1112V4.33343C31 2.44453 21.8148 6.62973 20 10.0001Z" fill="#F0F4FF"/>
<path d="M20 9.74947V31.5556C23.4089 23.6965 32.4261 22.9217 34.2222 23.0324V0.00865083C29.9996 -0.257008 20.8797 5.65389 20 9.74947Z" fill="url(#paint0_linear_5984_2811)"/>
<path opacity="0.5" d="M20 9.99988V31.8888C10.1111 26.4443 1.77775 29.9999 -3.43323e-05 31.9999V9.99987C6.99998 5.99986 18.1852 6.62951 20 9.99988Z" fill="#DBE5FF"/>
<path d="M20 10.0001V31.889C13.6667 23.6668 5.66664 25.6668 3.11108 26.1112V4.33343C8.99998 2.44453 18.1852 6.62973 20 10.0001Z" fill="#F0F4FF"/>
<path d="M20 9.74947V31.5556C16.5911 23.6965 7.57386 22.9217 5.77775 23.0324V0.00865083C10.0004 -0.257008 19.1203 5.65389 20 9.74947Z" fill="url(#paint1_linear_5984_2811)"/>
<defs>
<linearGradient id="paint0_linear_5984_2811" x1="20" y1="18.7778" x2="34.2222" y2="18.7778" gradientUnits="userSpaceOnUse">
<stop stop-color="#FAFBFF" stop-opacity="0.49"/>
<stop offset="1" stop-color="#FAFBFF"/>
</linearGradient>
<linearGradient id="paint1_linear_5984_2811" x1="20" y1="18.7778" x2="5.77775" y2="18.7778" gradientUnits="userSpaceOnUse">
<stop stop-color="#FAFBFF" stop-opacity="0.49"/>
<stop offset="1" stop-color="#FAFBFF"/>
</linearGradient>
</defs>
</svg>
`;

// Convert SVG to data URL for email compatibility
const LOGO_DATA_URL = `data:image/svg+xml;base64,${safeBase64Encode(LOGO_SVG)}`;

export const BookReturnReminderEmail = ({
  fullName = "Library Member",
  bookTitle = "Book Title",
  dueDate = "2025-04-30",
  daysRemaining = 3,
  borrowId = "",
}: BookReturnReminderEmailProps) => {
  // Format the due date for display
  const formattedDueDate = new Date(dueDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Determine urgency level based on days remaining
  const isUrgent = daysRemaining <= 2;
  const statusBoxColor = isUrgent ? "#B91C1C" : "#232839";
  const statusIconName = isUrgent ? "alarm" : "calendar-time";

  return (
    <Html>
      <Head>
        <title>Book Return Reminder - University Library</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
        />
      </Head>
      <Preview>
        {isUrgent
          ? `URGENT: Your book "${bookTitle}" is due in ${daysRemaining} day${
              daysRemaining === 1 ? "" : "s"
            }!`
          : `Reminder: Your book "${bookTitle}" is due in ${daysRemaining} days`}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header with Pattern Background */}
          <Section style={styles.headerSection}>
            <Row>
              <Column style={{ width: "100%", textAlign: "center" as const }}>
                <Img
                  src={LOGO_DATA_URL}
                  width="80"
                  height="64"
                  alt="University Library"
                  style={styles.logo}
                />
                <Heading style={styles.headerTitle}>UNIVERSITY LIBRARY</Heading>
              </Column>
            </Row>
          </Section>

          {/* Main Content Card */}
          <Section style={styles.mainCard}>
            <Section style={styles.cardContent}>
              <Heading style={styles.heading}>Book Return Reminder</Heading>

              <Text style={styles.welcomeText}>
                Hello {fullName}, this is a friendly reminder about your
                borrowed book that will be due soon.
              </Text>

              {/* Status Box */}
              <Section
                style={{ ...styles.statusBox, backgroundColor: statusBoxColor }}
              >
                <Row>
                  <Column style={{ width: "42px", verticalAlign: "middle" }}>
                    <Img
                      src={`https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/${statusIconName}.svg`}
                      width="24"
                      height="24"
                      alt="Due Date"
                      style={{
                        filter:
                          "invert(85%) sepia(14%) saturate(587%) hue-rotate(332deg) brightness(105%) contrast(97%)",
                      }}
                    />
                  </Column>
                  <Column style={{ verticalAlign: "middle" }}>
                    <Text style={styles.statusTitle}>
                      {isUrgent ? "URGENT: RETURN SOON" : "RETURN REMINDER"}
                    </Text>
                    <Text style={styles.statusText}>
                      Your book is due in{" "}
                      <strong>
                        {daysRemaining} day{daysRemaining === 1 ? "" : "s"}
                      </strong>{" "}
                      on {formattedDueDate}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* Book Details Section */}
              <Section style={styles.bookDetailsSection}>
                <Heading as="h3" style={styles.detailsHeading}>
                  Book Details
                </Heading>

                <Section style={styles.bookCard}>
                  <Row>
                    <Column style={{ width: "42px", verticalAlign: "top" }}>
                      <Img
                        src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/book.svg"
                        width="32"
                        height="32"
                        alt="Book"
                        style={{
                          filter:
                            "invert(16%) sepia(12%) saturate(1185%) hue-rotate(187deg) brightness(97%) contrast(95%)",
                        }}
                      />
                    </Column>
                    <Column style={{ verticalAlign: "top" }}>
                      <Text style={styles.bookTitle}>{bookTitle}</Text>
                      <Text style={styles.bookInfo}>
                        Due Date: {formattedDueDate}
                      </Text>
                    </Column>
                  </Row>
                </Section>
              </Section>

              {/* Return Options Section */}
              <Section style={styles.optionsSection}>
                <Heading as="h3" style={styles.optionsHeading}>
                  Return Options
                </Heading>

                <Row style={styles.optionRow}>
                  <Column style={styles.optionCol}>
                    <Section style={styles.optionBox}>
                      <Img
                        src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/building-library.svg"
                        width="32"
                        height="32"
                        alt="In-Person Return"
                        style={styles.optionIcon}
                      />
                      <Text style={styles.optionTitle}>In-Person Return</Text>
                      <Text style={styles.optionText}>
                        Visit the library circulation desk during opening hours
                      </Text>
                    </Section>
                  </Column>
                  <Column style={styles.optionCol}>
                    <Section style={styles.optionBox}>
                      <Img
                        src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/clock.svg"
                        width="32"
                        height="32"
                        alt="After Hours"
                        style={styles.optionIcon}
                      />
                      <Text style={styles.optionTitle}>After Hours</Text>
                      <Text style={styles.optionText}>
                        Use the book drop box located at the library entrance
                      </Text>
                    </Section>
                  </Column>
                </Row>
              </Section>

              {/* CTA Button */}
              <Section style={styles.ctaSection}>
                <Button
                  style={{
                    ...styles.button,
                    backgroundColor: isUrgent ? "#B91C1C" : "#E7C9A5",
                    color: isUrgent ? "#FFFFFF" : "#232839",
                  }}
                  href={`${baseUrl}/my-profile/borrowed-books`}
                >
                  View My Borrowed Books
                </Button>
              </Section>

              {/* Reminder Message */}
              {isUrgent && (
                <Text style={styles.urgentMessage}>
                  <strong>Please note:</strong> Late returns may incur fees and
                  affect your borrowing privileges.
                </Text>
              )}

              {/* Footer Message */}
              <Text style={styles.footerMessage}>
                If you've already returned this book, please disregard this
                message. For any questions, contact our support team at{" "}
                <Link href="mailto:support@library.edu" style={styles.link}>
                  support@library.edu
                </Link>
              </Text>

              <Text style={styles.signature}>
                Thank you,
                <br />
                <span style={styles.signatureName}>
                  The University Library Team
                </span>
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} University Library. All rights
              reserved.
            </Text>
            <Row style={styles.socialLinks}>
              <Column>
                <Link href="#" style={styles.socialLink}>
                  <Img
                    src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/facebook.svg"
                    width="24"
                    height="24"
                    alt="Facebook"
                    style={{
                      filter:
                        "invert(85%) sepia(14%) saturate(587%) hue-rotate(332deg) brightness(105%) contrast(97%)",
                    }}
                  />
                </Link>
              </Column>
              <Column>
                <Link href="#" style={styles.socialLink}>
                  <Img
                    src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/twitter.svg"
                    width="24"
                    height="24"
                    alt="Twitter"
                    style={{
                      filter:
                        "invert(85%) sepia(14%) saturate(587%) hue-rotate(332deg) brightness(105%) contrast(97%)",
                    }}
                  />
                </Link>
              </Column>
              <Column>
                <Link href="#" style={styles.socialLink}>
                  <Img
                    src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/instagram.svg"
                    width="24"
                    height="24"
                    alt="Instagram"
                    style={{
                      filter:
                        "invert(85%) sepia(14%) saturate(587%) hue-rotate(332deg) brightness(105%) contrast(97%)",
                    }}
                  />
                </Link>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles object
const styles = {
  body: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    backgroundColor: "#F5F7FA",
    margin: "0",
    padding: "0",
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
  },
  headerSection: {
    backgroundColor: "#232839",
    backgroundImage:
      "linear-gradient(135deg, rgba(51, 58, 86, 0.95) 0%, rgba(35, 40, 57, 0.95) 100%)",
    padding: "40px 0 30px",
    textAlign: "center" as const,
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
  },
  logo: {
    margin: "0 auto",
    filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))",
  },
  headerTitle: {
    color: "#E7C9A5",
    fontSize: "20px",
    fontWeight: "600",
    letterSpacing: "1px",
    margin: "16px 0 0",
  },
  mainCard: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: "8px",
    borderBottomRightRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  },
  cardContent: {
    padding: "40px",
  },
  heading: {
    fontSize: "28px",
    color: "#232839",
    fontWeight: "700",
    margin: "0 0 20px",
    textAlign: "center" as const,
  },
  welcomeText: {
    fontSize: "16px",
    lineHeight: "24px",
    color: "#4A5568",
    textAlign: "center" as const,
    margin: "0 0 32px",
  },
  statusBox: {
    backgroundColor: "#232839",
    borderRadius: "8px",
    padding: "20px 24px",
    marginBottom: "40px",
  },
  statusTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#E7C9A5",
    margin: "0 0 4px",
    letterSpacing: "0.5px",
  },
  statusText: {
    fontSize: "14px",
    color: "#F0F4FF",
    margin: "0",
    lineHeight: "20px",
  },
  bookDetailsSection: {
    marginBottom: "32px",
  },
  detailsHeading: {
    fontSize: "18px",
    color: "#232839",
    fontWeight: "600",
    textAlign: "center" as const,
    margin: "0 0 20px",
  },
  bookCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: "8px",
    padding: "20px",
    borderLeft: "3px solid #E7C9A5",
  },
  bookTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#232839",
    margin: "0 0 8px",
  },
  bookInfo: {
    fontSize: "14px",
    color: "#4A5568",
    margin: "0",
    lineHeight: "20px",
  },
  optionsSection: {
    marginBottom: "32px",
  },
  optionsHeading: {
    fontSize: "18px",
    color: "#232839",
    fontWeight: "600",
    textAlign: "center" as const,
    margin: "0 0 20px",
  },
  optionRow: {
    marginBottom: "20px",
  },
  optionCol: {
    width: "50%",
    paddingLeft: "8px",
    paddingRight: "8px",
  },
  optionBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center" as const,
    height: "100%",
    borderLeft: "3px solid #E7C9A5",
  },
  optionIcon: {
    marginBottom: "12px",
    display: "inline-block",
    filter:
      "invert(16%) sepia(12%) saturate(1185%) hue-rotate(187deg) brightness(97%) contrast(95%)",
  },
  optionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#232839",
    marginBottom: "8px",
  },
  optionText: {
    fontSize: "14px",
    color: "#4A5568",
    margin: "0",
    lineHeight: "20px",
  },
  ctaSection: {
    textAlign: "center" as const,
    marginBottom: "24px",
  },
  button: {
    backgroundColor: "#E7C9A5",
    borderRadius: "6px",
    color: "#232839",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "14px 28px",
    textAlign: "center" as const,
    display: "inline-block",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  },
  urgentMessage: {
    fontSize: "14px",
    color: "#B91C1C",
    textAlign: "center" as const,
    margin: "0 0 24px",
    lineHeight: "22px",
    padding: "12px",
    backgroundColor: "#FEF2F2",
    borderRadius: "6px",
    borderLeft: "3px solid #B91C1C",
  },
  footerMessage: {
    fontSize: "14px",
    color: "#4A5568",
    textAlign: "center" as const,
    margin: "0 0 24px",
    lineHeight: "22px",
  },
  link: {
    color: "#232839",
    textDecoration: "underline",
    fontWeight: "500",
  },
  signature: {
    fontSize: "14px",
    color: "#4A5568",
    textAlign: "center" as const,
    margin: "0",
    lineHeight: "22px",
  },
  signatureName: {
    color: "#232839",
    fontWeight: "600",
  },
  footer: {
    textAlign: "center" as const,
    padding: "32px 0",
  },
  footerText: {
    fontSize: "13px",
    color: "#718096",
    margin: "0 0 16px",
  },
  socialLinks: {
    display: "flex",
    justifyContent: "center" as const,
    gap: "20px",
  },
  socialLink: {
    display: "inline-block",
    margin: "0 8px",
  },
};

export default BookReturnReminderEmail;

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

interface NonActiveEmailProps {
  fullName: string;
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

export const NonActiveEmail = ({
  fullName = "Library Member",
}: NonActiveEmailProps) => {
  return (
    <Html>
      <Head>
        <title>We Miss You at the University Library</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
        />
      </Head>
      <Preview>We miss you at the University Library, {fullName}!</Preview>
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
              <Heading style={styles.heading}>We miss you, {fullName}!</Heading>

              <Text style={styles.welcomeText}>
                It's been a while since we've seen you at the University
                Library. We noticed you haven't logged in recently and wanted to
                check in. Our collection is constantly growing with new titles
                and resources just for you.
              </Text>

              {/* Status Box */}
              <Section style={styles.statusBox}>
                <Row>
                  <Column style={{ width: "42px", verticalAlign: "middle" }}>
                    <Img
                      src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/bookstack.svg"
                      width="24"
                      height="24"
                      alt="Books"
                      style={{
                        filter:
                          "invert(85%) sepia(14%) saturate(587%) hue-rotate(332deg) brightness(105%) contrast(97%)",
                      }}
                    />
                  </Column>
                  <Column style={{ verticalAlign: "middle" }}>
                    <Text style={styles.statusTitle}>NEW TITLES AVAILABLE</Text>
                    <Text style={styles.statusText}>
                      We've added dozens of new books and resources to our
                      collection since your last visit. Come back and discover
                      something new!
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* Recent Additions */}
              <Section style={styles.featuresSection}>
                <Heading as="h3" style={styles.featuresHeading}>
                  Recently Added to Our Collection
                </Heading>

                <Row style={styles.featureRow}>
                  <Column style={styles.featureCol}>
                    <Section style={styles.featureBox}>
                      <Img
                        src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/book.svg"
                        width="32"
                        height="32"
                        alt="Fiction"
                        style={styles.featureIcon}
                      />
                      <Text style={styles.featureTitle}>Fiction</Text>
                      <Text style={styles.featureText}>
                        New releases from award-winning authors
                      </Text>
                    </Section>
                  </Column>
                  <Column style={styles.featureCol}>
                    <Section style={styles.featureBox}>
                      <Img
                        src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/device-laptop.svg"
                        width="32"
                        height="32"
                        alt="Digital Resources"
                        style={styles.featureIcon}
                      />
                      <Text style={styles.featureTitle}>Digital Resources</Text>
                      <Text style={styles.featureText}>
                        E-books and research databases
                      </Text>
                    </Section>
                  </Column>
                </Row>

                <Row style={styles.featureRow}>
                  <Column style={styles.featureCol}>
                    <Section style={styles.featureBox}>
                      <Img
                        src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/school.svg"
                        width="32"
                        height="32"
                        alt="Academic Materials"
                        style={styles.featureIcon}
                      />
                      <Text style={styles.featureTitle}>
                        Academic Materials
                      </Text>
                      <Text style={styles.featureText}>
                        Updated textbooks and research papers
                      </Text>
                    </Section>
                  </Column>
                  <Column style={styles.featureCol}>
                    <Section style={styles.featureBox}>
                      <Img
                        src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/device-audio-tape.svg"
                        width="32"
                        height="32"
                        alt="Audio Books"
                        style={styles.featureIcon}
                      />
                      <Text style={styles.featureTitle}>Audio Books</Text>
                      <Text style={styles.featureText}>
                        Learn on the go with our audio collection
                      </Text>
                    </Section>
                  </Column>
                </Row>
              </Section>

              {/* CTA Button */}
              <Section style={styles.ctaSection}>
                <Button style={styles.button} href={baseUrl}>
                  Return to Library
                </Button>
              </Section>

              {/* Footer Message */}
              <Text style={styles.footerMessage}>
                If you need assistance with your account, please contact our
                support team at{" "}
                <Link href="mailto:support@library.edu" style={styles.link}>
                  support@library.edu
                </Link>
              </Text>

              <Text style={styles.signature}>
                Hope to see you soon,
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
  featuresSection: {
    marginBottom: "40px",
  },
  featuresHeading: {
    fontSize: "18px",
    color: "#232839",
    fontWeight: "600",
    textAlign: "center" as const,
    margin: "0 0 28px",
  },
  featureRow: {
    marginBottom: "20px",
  },
  featureCol: {
    width: "50%",
    paddingLeft: "8px",
    paddingRight: "8px",
  },
  featureBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center" as const,
    height: "100%",
    borderLeft: "3px solid #E7C9A5",
  },
  featureIcon: {
    marginBottom: "12px",
    display: "inline-block",
    filter:
      "invert(16%) sepia(12%) saturate(1185%) hue-rotate(187deg) brightness(97%) contrast(95%)",
  },
  featureTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#232839",
    marginBottom: "8px",
  },
  featureText: {
    fontSize: "14px",
    color: "#4A5568",
    margin: "0",
    lineHeight: "20px",
  },
  ctaSection: {
    textAlign: "center" as const,
    marginBottom: "32px",
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

export default NonActiveEmail;

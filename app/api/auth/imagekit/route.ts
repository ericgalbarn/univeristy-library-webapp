import config from "@/lib/config";
import ImageKit from "imagekit";
import { NextResponse } from "next/server";

const {
  env: {
    imagekit: { publicKey, privateKey, urlEndpoint },
  },
} = config;

// Create ImageKit instance with proper error handling
export async function GET() {
  try {
    // Validate that all required credentials are available
    if (!publicKey || !privateKey || !urlEndpoint) {
      console.error("Missing ImageKit credentials:", {
        publicKey: !!publicKey,
        privateKey: !!privateKey,
        urlEndpoint: !!urlEndpoint,
      });
      return NextResponse.json(
        { error: "ImageKit configuration is incomplete" },
        { status: 500 }
      );
    }

    // Initialize ImageKit with credentials
    const imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });

    // Get authentication parameters
    const authParams = imagekit.getAuthenticationParameters();
    return NextResponse.json(authParams);
  } catch (error) {
    console.error("ImageKit authentication error:", error);
    return NextResponse.json(
      { error: "Failed to generate ImageKit authentication parameters" },
      { status: 500 }
    );
  }
}

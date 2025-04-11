import config from "@/lib/config";
import { NextResponse } from "next/server";
import ImageKit from "imagekit";

export async function GET() {
  try {
    const {
      env: {
        imagekit: { publicKey, privateKey, urlEndpoint },
      },
    } = config;

    // Log the credentials (redacted for security)
    console.log("ImageKit credentials:", {
      publicKey: publicKey ? `${publicKey.substring(0, 10)}...` : "missing",
      privateKey: privateKey ? `${privateKey.substring(0, 10)}...` : "missing",
      urlEndpoint: urlEndpoint || "missing",
    });

    // Test if we can create the ImageKit instance
    const imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });

    // Get authentication parameters
    const authParams = imagekit.getAuthenticationParameters();

    // Return success with validation that required fields exist
    return NextResponse.json({
      success: true,
      hasSignature: !!authParams.signature,
      hasExpire: !!authParams.expire,
      hasToken: !!authParams.token,
      hasRequiredFields:
        !!authParams.signature && !!authParams.expire && !!authParams.token,
    });
  } catch (error) {
    console.error("ImageKit test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

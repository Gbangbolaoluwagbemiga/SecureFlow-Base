import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle Farcaster webhook events
    console.log("Farcaster webhook received:", body);

    // You can add custom logic here to handle different webhook events
    // For example: user interactions, app analytics, etc.

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "SecureFlow Farcaster webhook endpoint",
    status: "active",
  });
}

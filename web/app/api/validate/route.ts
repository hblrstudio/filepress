import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/validate
 * Body: { key: string }
 *
 * Proxies to Lemon Squeezy's license validation API.
 * Keeps LEMONSQUEEZY_API_KEY server-side — never shipped in the desktop binary.
 */
export async function POST(req: NextRequest) {
  const { key } = await req.json().catch(() => ({}));

  if (!key || typeof key !== "string" || key.trim().length === 0) {
    return NextResponse.json({ valid: false, error: "Missing license key." }, { status: 400 });
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    console.error("LEMONSQUEEZY_API_KEY is not set");
    return NextResponse.json({ valid: false, error: "Server misconfiguration." }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.lemonsqueezy.com/v1/licenses/validate", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ license_key: key.trim() }),
    });

    const data = await res.json();

    // Lemon Squeezy returns { valid: true } for active licenses
    const valid = data?.valid === true;
    if (valid) {
      return NextResponse.json({ valid: true });
    }

    // Distinguish common error states
    const status: string = data?.error ?? "";
    if (status.toLowerCase().includes("expired")) {
      return NextResponse.json({ valid: false, error: "This license has expired." });
    }
    if (status.toLowerCase().includes("disabled")) {
      return NextResponse.json({ valid: false, error: "This license has been disabled." });
    }
    return NextResponse.json({ valid: false, error: "Invalid license key." });
  } catch (err) {
    console.error("Lemon Squeezy validation error:", err);
    return NextResponse.json(
      { valid: false, error: "Validation service unavailable." },
      { status: 502 }
    );
  }
}

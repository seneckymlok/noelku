import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const apiKey = process.env.MAILCHIMP_API_KEY;
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
    const server = process.env.MAILCHIMP_SERVER_PREFIX;

    if (!apiKey || !audienceId || !server) {
      console.warn("Mailchimp env vars missing — accepting email without sync.");
      return NextResponse.json({ ok: true, note: "no-sync" });
    }

    const subscriberHash = crypto
      .createHash("md5")
      .update(email.toLowerCase())
      .digest("hex");

    const url = `https://${server}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
      },
      body: JSON.stringify({
        email_address: email,
        status_if_new: "subscribed",
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const detail = (data && (data.detail || data.title)) || "Subscription failed.";
      return NextResponse.json({ error: detail }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

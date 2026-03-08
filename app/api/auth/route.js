import { NextResponse } from "next/server";

export async function POST(req) {
  const { password } = await req.json();
  const correct = process.env.APP_PASSWORD;

  if (!correct) {
    return NextResponse.json(
      { error: "APP_PASSWORD not configured in .env.local" },
      { status: 500 }
    );
  }

  if (password === correct) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}

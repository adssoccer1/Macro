// app/api/kate-ai/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // avoid caching

import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.OPENAI_PROJECT,
});

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ ok: false, error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  const { messages } = await req.json();

  try {
    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages,
    });

    const text = resp.choices?.[0]?.message?.content ?? "";

    return NextResponse.json(
      { ok: true, text, usage: resp.usage, model: resp.model },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "OpenAI call failed" },
      { status: err?.status ?? 500 }
    );
  }
}
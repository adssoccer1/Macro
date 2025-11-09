import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const MODEL = process.env.KATE_AI_MODEL || "gpt-4o-mini";

export async function POST(req: NextRequest) {
  try {
    const { messages, snapshot } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const sys = [
      {
        role: "system",
        content:
          "You are Kate Capital AI, a concise macro research assistant. Focus on China’s growth, inflation, policy, and risk premia. Use the provided dashboard snapshot if present to ground your answer. If data is missing, say what you would need. Be brief, actionable, and avoid fluff.",
      },
      {
        role: "system",
        content:
          snapshot
            ? `DASHBOARD_SNAPSHOT:\n${JSON.stringify(snapshot).slice(0, 20000)}`
            : "No snapshot available.",
      },
    ];

    const resp = await openai.chat.completions.create({
      model: MODEL,
      messages: [...sys, ...(Array.isArray(messages) ? messages : [])],
      temperature: 0.3,
    });

    const reply = resp.choices?.[0]?.message?.content ?? "Sorry, I couldn’t generate a response.";
    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
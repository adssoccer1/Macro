import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import events from "@/app/dashboard/event-tape.json"

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

type Msg = { role: "user" | "assistant" | "system"; content: string }
type Body = { messages: Msg[]; include?: { signals?: boolean; events?: boolean; chart?: boolean } }

const SYSTEM = `You are Kate AI, a macro research copilot for PMs.
Be concise and concrete; bullets are fine. Use provided context (signals, events, chart window).
When asserting facts, prefer citing supplied {sourceName,url} links.
When asked for a take/trade, add a short 'Challenge' with 2–3 probing questions.`

// mock signals; wire real ones later
const signals = [
  { id: "sig1", date: "2025-11-07", tag: "Inflation", text: "CPI +0.7% m/m vs 0.2% est. (high)" },
  { id: "sig2", date: "2025-11-07", tag: "Rates", text: "10Y CGB closes > 3.00% (medium)" },
]

function summarizeContext(include?: Body["include"]) {
  const cites: { sourceName: string; url?: string }[] = []
  const lines: string[] = []
  if (include?.events) {
    const top = (events as any[]).slice(0, 6)
    lines.push("Recent Events:")
    top.forEach(e => {
      lines.push(`- ${e.datetime.slice(0,10)} • ${e.category} • ${e.headline}`)
      if (e.url) cites.push({ sourceName: e.sourceName ?? "Kate AI", url: e.url })
    })
  }
  if (include?.signals) {
    lines.push("Active Signals:")
    signals.slice(0, 4).forEach(s => lines.push(`- ${s.date} • ${s.tag}: ${s.text}`))
  }
  if (include?.chart) lines.push("Chart Window: Equities vs CNH (last 30d, mock).")
  return { text: lines.join("\n"), citations: cites }
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body
  const userMsg = body.messages.at(-1)?.content ?? ""
  const ctx = summarizeContext(body.include)

  // keep costs predictable
  const prompt = `User: ${userMsg}\n\nContext:\n${ctx.text}`.slice(0, 6000)

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    max_tokens: 600,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: prompt },
    ],
  })

  const content = completion.choices[0]?.message?.content ?? "Sorry, no response."
  const res = { role: "assistant", content, citations: ctx.citations.slice(0, 6) }

  // simple structured log to Vercel
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const ua = req.headers.get("user-agent") ?? ""
  const ref = req.headers.get("referer") ?? ""
  console.log("[agent]", JSON.stringify({ ts: new Date().toISOString(), ip, ua, ref, prompt: userMsg.slice(0, 2000), replyPreview: content.slice(0, 500) }))

  return NextResponse.json(res)
}
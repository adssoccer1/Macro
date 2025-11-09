"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getKateAIOpen, subscribeKateAI, openKateAI, closeKateAI } from "@/lib/ai-events";
import { readMarketSnapshot } from "@/lib/snapshot";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

export function AgentSheet() {
  const [open, setOpen] = React.useState(getKateAIOpen());
  const [messages, setMessages] = React.useState<Msg[]>([
    { role: "assistant", content: "Hi—ask me about China’s macro (growth, inflation, policy, risk premia)." },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const unsub = subscribeKateAI(setOpen);
    return unsub;
  }, []);

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Msg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const snapshot = readMarketSnapshot();
      const res = await fetch("/api/kate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: text }],
          snapshot,
        }),
      });
      const data = await res.json();
      const reply: Msg = {
        role: "assistant",
        content: data.reply || data.error || "No response.",
      };
      setMessages((m) => [...m, reply]);
    } catch (err: any) {
      setMessages((m) => [...m, { role: "assistant", content: `Error: ${err?.message ?? "unknown"}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        v ? openKateAI() : closeKateAI();
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-[520px] lg:max-w-[640px] p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle>Kate Capital AI</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <div
            ref={listRef}
            className="flex-1 overflow-auto p-4 space-y-3"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-md px-3 py-2 text-sm max-w-[85%]",
                  m.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground ml-auto"
                )}
              >
                {m.content}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
            <input
              className="flex-1 border rounded-md px-3 py-2 text-sm"
              placeholder="Ask about growth, inflation, policy, risk premia…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? "Thinking…" : "Send"}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
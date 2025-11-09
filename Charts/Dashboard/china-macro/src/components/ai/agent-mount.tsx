"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { AgentSheet } from "./agent-sheet";
import { getKateAIOpen, subscribeKateAI, openKateAI } from "@/lib/ai-events";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function AgentMount() {
  const [open, setOpen] = React.useState(getKateAIOpen());

  React.useEffect(() => {
    const unsub = subscribeKateAI(setOpen);
    return unsub;
  }, []);

  return (
    <>
      <AgentSheet />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Open Kate Capital AI"
              onClick={openKateAI}
              className={`fixed right-6 bottom-6 z-[60]
                          h-14 sm:h-16 px-4 sm:px-6 rounded-full shadow-xl ring-1 ring-foreground/15
                          flex items-center gap-2 sm:gap-3 transition-all
                          ${open ? "opacity-0 pointer-events-none scale-95" : "opacity-100"}`}
            >
              <Bot className="size-6 sm:size-7" />
              <span className="text-sm sm:text-base font-medium">
                Click to talk to Kate Capital AI
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Kate Capital AI</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
import type { Metadata } from "next";
import "./globals.css";
import AgentMount from "@/components/ai/agent-mount";

export const metadata: Metadata = {
  title: "China Macro Dashboard",
  description: "Prototype for Kate Capital",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <AgentMount />
      </body>
    </html>
  );
}
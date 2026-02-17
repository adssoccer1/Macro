"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { NavMain } from "@/components/nav-main";
import { Sidebar, SidebarHeader, SidebarContent } from "@/components/ui/sidebar";
import { Home, LineChart, Flame, DollarSign, Bot } from "lucide-react";
import { openKateAI } from "@/lib/ai-events";

export function AppSidebar() {
  const items = [
    { title: "Live Dashboard", url: "/dashboard", icon: Home },
    { title: "Growth", url: "/growth", icon: LineChart },
    { title: "Inflation", url: "/inflation", icon: Flame },
    { title: "Kate Capital AI", icon: Bot, onClick: openKateAI },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="px-2 py-2">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent transition-colors"
        >
          <Image
            src="/katecapital2.png"
            alt="Kate Capital"
            width={100}
            height={108}
            priority
            className="size-12 shrink-0 rounded-md object-cover ring-1 ring-border"
          />
          <span className="font-semibold leading-none truncate">
            Kate Capital – China 
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
    </Sidebar>
  );
}
"use client";

import * as React from "react";
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
    { title: "Risk Premiums", url: "/risk-premiums", icon: DollarSign },
    { title: "Kate Capital AI", icon: Bot, onClick: openKateAI },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="px-2 font-semibold">China Macro</Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
    </Sidebar>
  );
}
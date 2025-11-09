"use client"
import { create } from "zustand"

type AgentUI = { open: boolean; setOpen: (v: boolean) => void }
export const useAgentUI = create<AgentUI>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}))
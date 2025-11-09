"use client";

type Listener = (open: boolean) => void;

declare global {
  interface Window {
    __kc_ai_bus?: {
      isOpen: boolean;
      listeners: Set<Listener>;
    };
  }
}

// One shared bus across the whole app (even with multiple bundles)
const bus =
  typeof window !== "undefined"
    ? (window.__kc_ai_bus ??= { isOpen: false, listeners: new Set<Listener>() })
    : { isOpen: false, listeners: new Set<Listener>() };

export function getKateAIOpen() {
  return bus.isOpen;
}

export function subscribeKateAI(fn: Listener): () => void {
  bus.listeners.add(fn);
  return () => {
    bus.listeners.delete(fn); // return void
  };
}

export function openKateAI() {
  if (!bus.isOpen) {
    bus.isOpen = true;
    bus.listeners.forEach((l) => l(true));
  }
}

export function closeKateAI() {
  if (bus.isOpen) {
    bus.isOpen = false;
    bus.listeners.forEach((l) => l(false));
  }
}

export function toggleKateAI() {
  bus.isOpen ? closeKateAI() : openKateAI();
}
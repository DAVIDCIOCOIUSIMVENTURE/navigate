"use client"

import { createContext, useContext } from "react"

export type FocusChromeContextValue = {
  revealTopNav: () => void
}

export const FocusChromeContext = createContext<FocusChromeContextValue | null>(null)

export function useFocusChrome(): FocusChromeContextValue {
  const ctx = useContext(FocusChromeContext)
  if (!ctx) {
    throw new Error("useFocusChrome must be used within FocusChromeContext.Provider")
  }
  return ctx
}

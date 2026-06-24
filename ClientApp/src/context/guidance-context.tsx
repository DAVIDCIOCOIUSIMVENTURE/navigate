"use client"

import { createContext, useContext } from "react"

interface GuidanceContextValue {
  openGuidance: (topic?: string) => void
}

const GuidanceContext = createContext<GuidanceContextValue | null>(null)

export function GuidanceProvider({
  children,
  onOpen,
}: {
  children: React.ReactNode
  onOpen: (topic?: string) => void
}) {
  return (
    <GuidanceContext.Provider value={{ openGuidance: onOpen }}>
      {children}
    </GuidanceContext.Provider>
  )
}

export function useGuidance() {
  const ctx = useContext(GuidanceContext)
  if (!ctx) throw new Error("useGuidance must be used within GuidanceProvider")
  return ctx
}

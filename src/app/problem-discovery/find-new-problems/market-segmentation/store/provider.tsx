"use client"

import { useRef } from "react"
import { Provider } from "react-redux"
import { createStore, type AppStore } from "."

export function MarketSegmentationStoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null)
  if (!storeRef.current) {
    storeRef.current = createStore()
  }
  return <Provider store={storeRef.current}>{children}</Provider>
}

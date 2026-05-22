"use client"

import dynamic from "next/dynamic"

const RootLayoutClient = dynamic(() => import("@/app/root-layout-client"), {
  ssr: false,
})

export default function AppShell({ children }: { children: React.ReactNode }) {
  return <RootLayoutClient>{children}</RootLayoutClient>
}

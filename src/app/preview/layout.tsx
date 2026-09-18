"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { AppStoreProvider } from "@/store/provider"

/**
 * The public preview sits outside the `(app)` group on purpose: it has no
 * sidebar, no header and no login (see `PUBLIC_PATHS` in `src/middleware.ts`),
 * so it carries only the store and the tooltip provider its content needs.
 */
export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppStoreProvider>
      <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
    </AppStoreProvider>
  )
}

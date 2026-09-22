"use client"

import Link from "next/link"
import { Home, PanelTop } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFocusChrome } from "@/context/focus-chrome-context"
import { cn } from "@/lib/utils"

/**
 * The pair of chrome buttons a focus page carries in place of the hidden
 * header and sidebar: Home, which leaves the flow for the projects list, and
 * Open menu, which pulls the top bar back into view. Every focus flow, hub and
 * focus page renders this one component so the pair never drifts apart.
 */
export function FocusChromeButtons({ className }: { className?: string }) {
  const { revealTopNav } = useFocusChrome()

  return (
    <div className={cn("flex items-center gap-2 shrink-0", className)}>
      <Button variant="tertiary-outline" asChild className="gap-2">
        <Link href="/">
          <Home className="h-4 w-4" />
          Home
        </Link>
      </Button>
      <Button
        variant="outline"
        className="gap-2 bg-white"
        onClick={revealTopNav}
        aria-label="Open menu"
        title="Open menu"
      >
        <PanelTop className="h-4 w-4" />
        Menu
      </Button>
    </div>
  )
}

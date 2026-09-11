"use client"

import { useEffect, useState } from "react"
import { FlowShell } from "@/components/flow-shell"
import { BookOpen, LayoutTemplate, Scale, SlidersHorizontal, type LucideIcon } from "lucide-react"
import { COMPARE_BASE, NAV_ITEMS } from "./steps"

const NAV_ICONS: Record<string, LucideIcon> = {
  introduction: BookOpen,
  rate: SlidersHorizontal,
  review: LayoutTemplate,
}

/**
 * Compare solutions is a focus flow rendered through the generic `FlowShell`:
 * Back returns to the Solutions page and the step nav lists Introduction,
 * Rate solutions and Review. It is about every solution rather than one, so
 * there is no context card under the steps and no journey rail.
 */
export default function CompareSolutionsLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <FlowShell
      title="Compare solutions"
      icon={Scale}
      navLabel="Compare solutions steps"
      backHref="/solutions"
      base={COMPARE_BASE}
      navItems={NAV_ITEMS}
      navIcons={NAV_ICONS}
    >
      {mounted ? children : null}
    </FlowShell>
  )
}

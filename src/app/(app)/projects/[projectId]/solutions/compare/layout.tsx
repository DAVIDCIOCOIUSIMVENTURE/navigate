"use client"

import { useEffect, useState } from "react"
import { FlowShell } from "@/components/flow-shell"
import { useProjectScope } from "@/hooks/use-projects"
import { projectRoutes } from "@/lib/projects"
import { BookOpen, LayoutTemplate, Scale, SlidersHorizontal, type LucideIcon } from "lucide-react"
import { NAV_ITEMS } from "./steps"

const NAV_ICONS: Record<string, LucideIcon> = {
  introduction: BookOpen,
  rate: SlidersHorizontal,
  review: LayoutTemplate,
}

/**
 * Compare solutions is a focus flow rendered through the generic `FlowShell`:
 * the step nav lists Introduction, Rate solutions and Review. It is about
 * every solution in the project rather than one, so there is no context card
 * under the steps and no journey rail.
 */
export default function CompareSolutionsLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const { projectId } = useProjectScope()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <FlowShell
      title="Compare solutions"
      icon={Scale}
      navLabel="Compare solutions steps"
      base={projectRoutes.compareBase(projectId)}
      navItems={NAV_ITEMS}
      navIcons={NAV_ICONS}
    >
      {mounted ? children : null}
    </FlowShell>
  )
}

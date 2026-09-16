"use client"

import { ProjectGate } from "@/components/project-gates"
import { useProjectScope } from "@/hooks/use-projects"

/**
 * Every way of identifying the project's problem sits under here: the hub,
 * the Canvas Builder, Reflect and Research. They all save into the project
 * named in the URL, so none of them may render before the store has loaded
 * and that project is known to exist.
 */
export default function IdentifyLayout({ children }: { children: React.ReactNode }) {
  const scope = useProjectScope()
  return <ProjectGate scope={scope}>{children}</ProjectGate>
}

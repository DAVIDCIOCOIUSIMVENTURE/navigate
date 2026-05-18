"use client"

import { Fragment, type ReactNode } from "react"
import { usePathname, useParams, notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"
import { getReflectLens } from "@/data/reflectLenses"
import { ReflectProvider, getReflectNavItems, type ReflectNavItem } from "./context"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

function getActiveStepIndex(
  pathname: string,
  lensId: string,
  navItems: readonly ReflectNavItem[]
): number {
  const base = `/problems/reflect/${lensId}/`
  return navItems.findIndex((item) => pathname.startsWith(`${base}${item.path}`))
}

function Stepper({
  navItems,
  activeIdx,
}: {
  navItems: readonly ReflectNavItem[]
  activeIdx: number
}) {
  return (
    <div className="flex items-center w-full">
      {navItems.map((item, i) => {
        const isActive = i === activeIdx
        const isCompleted = activeIdx >= 0 && i < activeIdx
        return (
          <Fragment key={item.path}>
            <div
              className="flex items-center gap-2 shrink-0"
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex items-center justify-center h-7 w-7 rounded-full text-base font-bold border-2",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCompleted
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-transparent"
                )}
                aria-hidden="true"
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-base whitespace-nowrap",
                  isActive ? "font-semibold" : ""
                )}
              >
                {item.label}
              </span>
            </div>
            {i < navItems.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-3 min-w-3",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
                aria-hidden="true"
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

function MobileStepper({
  navItems,
  activeIdx,
}: {
  navItems: readonly ReflectNavItem[]
  activeIdx: number
}) {
  const active = activeIdx >= 0 ? navItems[activeIdx] : null
  const total = navItems.length
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex items-center justify-center h-7 w-7 rounded-full text-base font-bold border-2 border-primary bg-primary text-primary-foreground shrink-0"
        aria-hidden="true"
      >
        {Math.max(activeIdx, 0) + 1}
      </span>
      <span className="text-base font-medium truncate">
        {active ? `Step ${activeIdx + 1} of ${total}: ${active.label}` : "Reflect"}
      </span>
    </div>
  )
}

export default function LensLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ lensId: string }>()
  const pathname = usePathname()
  const lens = getReflectLens(params.lensId)
  if (!lens) notFound()

  const navItems = getReflectNavItems(lens)
  const activeIdx = getActiveStepIndex(pathname, params.lensId, navItems)
  const isWide = useContainerSize() === "wide"

  return (
    <ReflectProvider lens={lens}>
      <div className="flex flex-col gap-4 w-full flex-1 min-h-0">
        <Card>
          <CardContent className="px-6 py-4">
            {isWide ? (
              <Stepper navItems={navItems} activeIdx={activeIdx} />
            ) : (
              <MobileStepper navItems={navItems} activeIdx={activeIdx} />
            )}
          </CardContent>
        </Card>
        <div className="flex-1 min-h-0">{children}</div>
      </div>
    </ReflectProvider>
  )
}

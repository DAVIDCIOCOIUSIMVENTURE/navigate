"use client"

import { Fragment, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { ReflectNavItem } from "@/app/(app)/problems/reflect/[lensId]/context"

type StepState = "active" | "completed" | "default"

function getStepState(i: number, activeIdx: number): StepState {
  if (i === activeIdx) return "active"
  if (activeIdx >= 0 && i < activeIdx) return "completed"
  return "default"
}

function StepBadge({ index, state }: { index: number; state: StepState }) {
  return (
    <span
      className={cn(
        "flex items-center justify-center h-7 w-7 rounded-full text-base font-bold border-2 shrink-0",
        state === "active"
          ? "border-primary bg-primary text-primary-foreground"
          : state === "completed"
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-transparent"
      )}
      aria-hidden="true"
    >
      {state === "completed" ? <Check className="h-3.5 w-3.5" /> : index + 1}
    </span>
  )
}

export function LensStepper({
  navItems,
  activeIdx,
  lensId,
}: {
  navItems: readonly ReflectNavItem[]
  activeIdx: number
  lensId: string
}) {
  return (
    <div className="flex items-center w-full">
      {navItems.map((item, i) => {
        const state = getStepState(i, activeIdx)
        const isActive = state === "active"
        const isCompleted = state === "completed"
        const stepContent = (
          <>
            <StepBadge index={i} state={state} />
            <span
              className={cn(
                "text-base whitespace-nowrap",
                isActive ? "font-semibold" : ""
              )}
            >
              {item.label}
            </span>
          </>
        )
        return (
          <Fragment key={item.path}>
            {isCompleted ? (
              <Link
                href={`/problems/reflect/${lensId}/${item.path}`}
                aria-current={undefined}
                className="flex items-center gap-2 shrink-0 rounded-md -mx-1 px-1 py-0.5 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {stepContent}
              </Link>
            ) : (
              <div
                className="flex items-center gap-2 shrink-0"
                aria-current={isActive ? "step" : undefined}
              >
                {stepContent}
              </div>
            )}
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

export function LensMobileStepper({
  navItems,
  activeIdx,
  lensId,
}: {
  navItems: readonly ReflectNavItem[]
  activeIdx: number
  lensId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const activeItem = activeIdx >= 0 ? navItems[activeIdx] : null
  const total = navItems.length

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-auto py-2 px-3 bg-white"
        >
          <span className="flex items-center gap-2 text-base font-medium min-w-0">
            <StepBadge
              index={activeIdx >= 0 ? activeIdx : 0}
              state={activeItem ? "active" : "default"}
            />
            <span className="truncate">
              {activeItem
                ? `Step ${activeIdx + 1} of ${total}: ${activeItem.label}`
                : "Reflect"}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform shrink-0",
              open && "rotate-180"
            )}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[16rem] p-1 bg-white"
      >
        {navItems.map((item, i) => {
          const state = getStepState(i, activeIdx)
          const isActive = state === "active"
          const isCompleted = state === "completed"
          const isClickable = isCompleted
          return (
            <DropdownMenuItem
              key={item.path}
              disabled={!isClickable && !isActive}
              onSelect={(e) => {
                if (!isClickable) {
                  e.preventDefault()
                  return
                }
                router.push(`/problems/reflect/${lensId}/${item.path}`)
              }}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "flex items-center gap-2.5 py-2 px-3 text-base",
                isActive && "bg-accent"
              )}
            >
              <StepBadge index={i} state={state} />
              <span
                className={cn(
                  "whitespace-normal text-left",
                  isActive
                    ? "font-semibold text-foreground"
                    : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

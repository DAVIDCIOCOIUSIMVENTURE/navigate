"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Check,
  ChevronDown,
  Lightbulb,
  Target,
  Plus,
} from "lucide-react"
import { useRouter } from "@/lib/router"
import { ProblemsTable } from "@/components/problems-table"
import { SolutionsTable } from "@/components/solutions-table"
import { useState } from "react"
import { useSelector } from "react-redux"

import type { RootState } from "@/store"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

const VIEW_OPTIONS = [
  { value: "problems" as const, label: "Problems", icon: Target },
  { value: "solutions" as const, label: "Solutions", icon: Lightbulb },
]

export default function DashboardPage() {
  const router = useRouter()
  const problems = useSelector((state: RootState) => state.problems.problems)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const [view, setView] = useState<"problems" | "solutions">("problems")

  const isWide = useContainerSize() === "wide"

  return (
    <div className={cn("flex flex-col gap-3 w-full flex-1 min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}>
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <p className="flex-1 min-w-[16rem] text-base leading-relaxed">
              This is your <span className="font-bold">home</span>, a single view of everything you&apos;ve captured so far.
              Switch between your <span className="font-bold">problems</span> and your <span className="font-bold">solutions</span> using the menu next to the table title,
              then open any one to carry on refining or validating it. When you&apos;re ready to add more, start a new identify session from here.
            </p>
            <div className="flex flex-col items-stretch gap-2 shrink-0">
              <Button onClick={() => router.push("/problems/identify")} className="gap-2">
                <Plus className="h-4 w-4" />
                Identify new problems
              </Button>
              <Button onClick={() => router.push("/solutions/identify")} className="gap-2">
                <Plus className="h-4 w-4" />
                Identify new solutions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toggleable problems / solutions table */}
      <div className="flex flex-1 min-h-0 flex-col">
        {(() => {
          const tableClassName = cn(isWide ? "flex-1 min-h-0 min-w-0" : "min-h-[320px] max-h-[640px]")
          const viewToggle = (
            <div className="flex items-center gap-2 shrink-0">
              <CardTitle size="md" icon={view === "problems" ? Target : Lightbulb}>
                {view === "problems" ? "Problems" : "Solutions"}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={`Switch view, currently showing ${view}`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {VIEW_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onSelect={() => setView(option.value)}
                      className="gap-2"
                    >
                      <option.icon className="h-4 w-4" />
                      <span className="flex-1">{option.label}</span>
                      {view === option.value && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
          return view === "problems" ? (
            <ProblemsTable
              problems={problems}
              showStatus
              showEditDelete
              showSource={false}
              className={tableClassName}
              headerLead={viewToggle}
            />
          ) : (
            <SolutionsTable
              solutions={solutions}
              showStatus
              showEditDelete
              className={tableClassName}
              headerLead={viewToggle}
            />
          )
        })()}
      </div>

    </div>
  )
}

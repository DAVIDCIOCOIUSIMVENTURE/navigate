"use client"

import { Card, CardContent } from "@/components/ui/card"
import { getNextStepsTopicIcon } from "@/config/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "@/lib/router"
import { ChevronDown, Milestone, type LucideIcon } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { NEXT_STEPS_TOPICS } from "@/data/nextStepsData"
import { useContainerSize } from "@/context/container-size-context"

function NavContent({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate: (path: string) => void
}) {
  const renderItem = (isActive: boolean, Icon: LucideIcon, label: string, href: string) => (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start h-auto whitespace-normal text-left py-1.5 gap-2 hover:text-tertiary",
        isActive && "text-tertiary",
      )}
      onClick={() => onNavigate(href)}
    >
      <span
        className={cn(
          "flex items-center justify-center w-6 h-6 rounded-md shrink-0",
          isActive ? "bg-tertiary" : "bg-tertiary/10",
        )}
      >
        <Icon
          className={cn("h-3.5 w-3.5", isActive ? "text-white" : "text-tertiary")}
          aria-hidden="true"
        />
      </span>
      <span className="flex-1 text-left">{label}</span>
    </Button>
  )

  return (
    <div className="flex flex-col gap-1">
      {renderItem(pathname === "/next-steps", Milestone, "Introduction", "/next-steps")}
      {NEXT_STEPS_TOPICS.map((topic) => {
        const isActive = pathname === `/next-steps/${topic.url}`
        const TopicIcon = getNextStepsTopicIcon(topic.iconKey)
        return (
          <div key={topic.url}>
            {renderItem(isActive, TopicIcon, topic.shortTitle, `/next-steps/${topic.url}`)}
          </div>
        )
      })}
    </div>
  )
}

function getActiveInfo(pathname: string): { label: string; Icon: LucideIcon } {
  if (pathname === "/next-steps") {
    return { label: "Introduction", Icon: Milestone }
  }
  for (const topic of NEXT_STEPS_TOPICS) {
    if (pathname === `/next-steps/${topic.url}`) {
      return {
        label: topic.shortTitle,
        Icon: getNextStepsTopicIcon(topic.iconKey),
      }
    }
  }
  return { label: "Next Steps", Icon: Milestone }
}

export default function NextStepsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const size = useContainerSize()
  const isWide = size === "wide"

  const handleNavigate = (path: string) => {
    setMobileNavOpen(false)
    router.push(path)
  }

  const { label: activeLabel, Icon: ActiveIcon } = getActiveInfo(pathname)

  return (
    <div
      className={cn(
        "flex h-full w-full flex-1 min-h-0",
        isWide ? "flex-row gap-3 overflow-hidden max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]" : "flex-col gap-3",
      )}
    >
      {!isWide && (
        <nav aria-label="Next Steps topics" className="w-full shrink-0">
          <Collapsible open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <Card>
              <CardContent className="p-2">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-auto py-2 px-3"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium min-w-0">
                      <span className="flex items-center justify-center w-6 h-6 rounded-md shrink-0 bg-tertiary">
                        <ActiveIcon className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                      </span>
                      <span className="truncate">{activeLabel}</span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${mobileNavOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="px-1">
                    <NavContent pathname={pathname} onNavigate={handleNavigate} />
                  </div>
                </CollapsibleContent>
              </CardContent>
            </Card>
          </Collapsible>
        </nav>
      )}

      {isWide && (
        <Card className="w-72 overflow-y-auto shrink-0">
          <CardContent className="p-3">
            <div className="flex flex-col gap-1">
              <NavContent pathname={pathname} onNavigate={handleNavigate} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex-1 min-h-0 min-w-0">
        {children}
      </div>
    </div>
  )
}

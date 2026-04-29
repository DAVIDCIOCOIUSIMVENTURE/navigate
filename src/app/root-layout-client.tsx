"use client"

import React from "react"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Settings, HelpCircle, NotebookText, LayoutDashboard, Target, Lightbulb, Search, ClipboardCheck, BookOpen, Compass, type LucideIcon } from "lucide-react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { JournalPanel } from "@/components/journal-panel"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { GuidanceDialog } from "@/components/guidance-dialog"
import { GuidanceProvider } from "@/context/guidance-context"
import { NavigationGuardProvider } from "@/context/navigation-guard-context"
import { ContainerSizeContext, useObserveContainerSize } from "@/context/container-size-context"
import { AppStoreProvider } from "@/store/provider"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { Toaster } from "@/components/ui/sonner"
import { TeamAvatars } from "@/components/team-avatars"
import Link from "next/link"

function ContentArea({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const size = useObserveContainerSize(ref)
  return (
    <div ref={ref} className="flex flex-1 w-full min-h-0">
      <ContainerSizeContext.Provider value={size}>
        {children}
      </ContainerSizeContext.Provider>
    </div>
  )
}
function getSection(pathname: string): { title: string; Icon: LucideIcon } | null {
  if (pathname === "/") return { title: "Dashboard", Icon: LayoutDashboard }

  const segments = pathname.split("/").filter(Boolean)
  const [first, second, third] = segments

  if (first === "foundations") return { title: "Why It Matters", Icon: BookOpen }

  if (first === "self-discovery") return { title: "Self Discovery", Icon: Compass }

  if (first === "problems") {
    if (segments.length === 1) return { title: "Problems", Icon: Target }
    if (second === "brainstorm") return { title: "Discover Problems", Icon: Search }
    return { title: "Problem Validation", Icon: ClipboardCheck }
  }

  if (first === "solutions") {
    if (segments.length === 1) return { title: "Solutions", Icon: Lightbulb }
    if (second === "discover") return { title: "Solution Discovery", Icon: Search }
    if (third === "validate") return { title: "Solution Validation", Icon: ClipboardCheck }
  }

  return null
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const section = getSection(pathname)
  const [guidanceOpen, setGuidanceOpen] = useState(false)
  const [guidanceTopic, setGuidanceTopic] = useState<string | undefined>(undefined)

  const openGuidance = (topic?: string) => {
    setGuidanceTopic(topic)
    setGuidanceOpen(true)
  }

  const sidebarMode = useSelector((state: RootState) => state.settings.sidebarMode)
  const fullView = useSelector((state: RootState) => state.settings.fullView)
  const journalOpen = useSelector((state: RootState) => state.settings.journalOpen)
  const dispatch = useDispatch<AppDispatch>()

  // Load persisted settings from localStorage on mount
  useEffect(() => {
    dispatch.settings.init()
    dispatch.problemTriggers.init()
    dispatch.problems.init()
    dispatch.accountSettings.init()
    dispatch.solutions.init()
    dispatch.solutionWorkspaces.init()
    dispatch.notes.init()
  }, [dispatch.settings, dispatch.problemTriggers, dispatch.problems, dispatch.accountSettings, dispatch.solutions, dispatch.solutionWorkspaces, dispatch.notes])

  return (
    <SidebarProvider
      sidebarMode={sidebarMode}
      onSidebarModeChange={(mode) => dispatch.settings.setSidebarMode(mode)}
      className="h-svh !min-h-0 overflow-hidden"
    >
      {!fullView && <AppSidebar />}
      <SidebarInset>
        {!fullView && (
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            {section && (
              <h1 className="flex items-center gap-2 ml-2 text-xl font-bold">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary shrink-0" aria-hidden="true">
                  <section.Icon className="h-4 w-4 text-primary-foreground" />
                </span>
                {section.title}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TeamAvatars />
            <Button
              variant={journalOpen ? "default" : "outline"}
              className="flex flex-row items-center gap-2 justify-center"
              onClick={() => dispatch.settings.setJournalOpen(!journalOpen)}
              aria-pressed={journalOpen}
            >
              <NotebookText />
              <span>Journal</span>
            </Button>
            <Button variant="outline" className="flex flex-row items-center gap-2 justify-center" onClick={() => openGuidance()}>
              <HelpCircle />
              <span>Guidance</span>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link href="/settings">
                <Settings />
              </Link>
            </Button>
          </div>
        </header>
        )}
        <GuidanceProvider onOpen={openGuidance}>
          {journalOpen ? (
            <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
              <ResizablePanel defaultSize={70} minSize={40}>
                <div className={`flex h-full flex-col gap-4 bg-gray-100 min-h-0 overflow-y-auto ${fullView ? "px-6 py-6" : "px-4 py-6 sm:px-6 lg:px-12 lg:py-10"}`}>
                  <ContentArea>{children}</ContentArea>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={30} minSize={20} maxSize={60}>
                <JournalPanel onClose={() => dispatch.settings.setJournalOpen(false)} />
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <div className={`flex flex-1 flex-col gap-4 bg-gray-100 min-h-0 overflow-y-auto ${fullView ? "px-6 py-6" : "px-4 py-6 sm:px-6 lg:px-12 lg:py-10"}`}>
              <ContentArea>{children}</ContentArea>
            </div>
          )}
        </GuidanceProvider>
      </SidebarInset>
      <GuidanceDialog open={guidanceOpen} onOpenChange={setGuidanceOpen} initialTopic={guidanceTopic} />
      <Toaster />
    </SidebarProvider>
  )
}

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppStoreProvider>
      <NavigationGuardProvider>
        <LayoutContent>{children}</LayoutContent>
      </NavigationGuardProvider>
    </AppStoreProvider>
  )
}

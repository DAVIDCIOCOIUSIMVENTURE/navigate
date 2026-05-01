"use client"

import React from "react"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Settings, HelpCircle, NotebookText, LayoutDashboard, Target, Lightbulb, Search, ClipboardCheck, BookOpen, Compass, Milestone, type LucideIcon } from "lucide-react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { JournalPanel } from "@/components/journal-panel"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { GuidancePanel } from "@/components/guidance-panel"
import { GuidanceProvider } from "@/context/guidance-context"
import { useIsMobile } from "@/hooks/use-mobile"
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

  if (first === "settings") return { title: "Settings", Icon: Settings }

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

  if (first === "next-steps") return { title: "Next Steps", Icon: Milestone }

  return null
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const section = getSection(pathname)
  const [guidanceOpen, setGuidanceOpen] = useState(false)
  const [guidanceTopic, setGuidanceTopic] = useState<string | undefined>(undefined)
  const isMobile = useIsMobile()

  const sidebarMode = useSelector((state: RootState) => state.settings.sidebarMode)
  const fullView = useSelector((state: RootState) => state.settings.fullView)
  const journalOpen = useSelector((state: RootState) => state.settings.journalOpen)
  const dispatch = useDispatch<AppDispatch>()

  const openGuidance = (topic?: string) => {
    setGuidanceTopic(topic)
    setGuidanceOpen(true)
    dispatch.settings.setJournalOpen(false)
  }

  const closeGuidance = () => setGuidanceOpen(false)

  const toggleGuidance = () => {
    if (guidanceOpen) closeGuidance()
    else openGuidance()
  }

  const toggleJournal = () => {
    if (journalOpen) {
      dispatch.settings.setJournalOpen(false)
    } else {
      dispatch.settings.setJournalOpen(true)
      setGuidanceOpen(false)
    }
  }

  const closeJournal = () => dispatch.settings.setJournalOpen(false)

  const sidePanelOpen = !isMobile && (guidanceOpen || journalOpen)

  // Load persisted settings from localStorage on mount
  useEffect(() => {
    dispatch.settings.init()
    dispatch.selfDiscoveryItems.init()
    dispatch.customBrainstormItems.init()
    dispatch.problems.init()
    dispatch.accountSettings.init()
    dispatch.solutions.init()
    dispatch.solutionWorkspaces.init()
    dispatch.notes.init()
  }, [dispatch.settings, dispatch.selfDiscoveryItems, dispatch.customBrainstormItems, dispatch.problems, dispatch.accountSettings, dispatch.solutions, dispatch.solutionWorkspaces, dispatch.notes])

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
          <div className="flex items-center gap-2 min-w-0">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            {section && (
              <h1 className="flex items-center gap-2 ml-2 text-xl font-bold min-w-0">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary shrink-0" aria-hidden="true">
                  <section.Icon className="h-4 w-4 text-primary-foreground" />
                </span>
                <span className="truncate">{section.title}</span>
              </h1>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:block">
              <TeamAvatars />
            </div>
            <Button
              variant={journalOpen ? "default" : "outline"}
              size="icon"
              className="lg:hidden"
              onClick={toggleJournal}
              aria-pressed={journalOpen}
              aria-label="Toggle journal"
            >
              <NotebookText />
            </Button>
            <Button
              variant={journalOpen ? "default" : "outline"}
              className="hidden lg:flex flex-row items-center gap-2 justify-center"
              onClick={toggleJournal}
              aria-pressed={journalOpen}
            >
              <NotebookText />
              <span>Journal</span>
            </Button>
            <Button
              variant={guidanceOpen ? "default" : "outline"}
              size="icon"
              className="lg:hidden"
              onClick={toggleGuidance}
              aria-pressed={guidanceOpen}
              aria-label="Toggle guidance"
            >
              <HelpCircle />
            </Button>
            <Button
              variant={guidanceOpen ? "default" : "outline"}
              className="hidden lg:flex flex-row items-center gap-2 justify-center"
              onClick={toggleGuidance}
              aria-pressed={guidanceOpen}
            >
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
          {sidePanelOpen ? (
            <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
              <ResizablePanel defaultSize={70} minSize={40}>
                <div className={`flex h-full flex-col gap-4 bg-gray-100 min-h-0 overflow-y-auto ${fullView ? "px-6 py-6" : "px-4 py-6 sm:px-6 lg:px-8 lg:py-8"}`}>
                  <ContentArea>{children}</ContentArea>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={30} minSize={20} maxSize={60}>
                {guidanceOpen ? (
                  <GuidancePanel onClose={closeGuidance} initialTopic={guidanceTopic} />
                ) : (
                  <JournalPanel onClose={closeJournal} />
                )}
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <div className={`flex flex-1 flex-col gap-4 bg-gray-100 min-h-0 overflow-y-auto ${fullView ? "px-6 py-6" : "px-4 py-6 sm:px-6 lg:px-8 lg:py-8"}`}>
              <ContentArea>{children}</ContentArea>
            </div>
          )}
        </GuidanceProvider>
      </SidebarInset>
      {isMobile && (
        <Sheet open={guidanceOpen} onOpenChange={setGuidanceOpen}>
          <SheetContent side="right" className="w-full sm:max-w-xl p-0" hideClose>
            <VisuallyHidden>
              <SheetTitle>Guidance</SheetTitle>
            </VisuallyHidden>
            <GuidancePanel onClose={closeGuidance} initialTopic={guidanceTopic} />
          </SheetContent>
        </Sheet>
      )}
      {isMobile && (
        <Sheet open={journalOpen} onOpenChange={(o) => dispatch.settings.setJournalOpen(o)}>
          <SheetContent side="right" className="w-full sm:max-w-md p-0" hideClose>
            <VisuallyHidden>
              <SheetTitle>Journal</SheetTitle>
            </VisuallyHidden>
            <JournalPanel onClose={closeJournal} />
          </SheetContent>
        </Sheet>
      )}
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

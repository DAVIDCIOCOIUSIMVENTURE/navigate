"use client"

import React from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Settings, HelpCircle, NotebookText, Compass, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Problem } from "@/store/problems-model"
import type { Solution } from "@/types/solution"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { navigationItems } from "@/config/navigation"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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
import { FocusChromeContext } from "@/context/focus-chrome-context"
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
    <div ref={ref} className="flex flex-1 flex-col w-full min-h-0">
      <ContainerSizeContext.Provider value={size}>
        {children}
      </ContainerSizeContext.Provider>
    </div>
  )
}
type Crumb = { label: string; href?: string; truncate?: boolean }

function getCrumbs(pathname: string, problems: Problem[], solutions: Solution[]): Crumb[] {
  if (pathname === "/") return [{ label: "Home" }]
  const crumbs: Crumb[] = [{ label: "Home", href: "/" }]
  const segments = pathname.split("/").filter(Boolean)
  const [first, second, third] = segments

  if (first === "foundations") {
    crumbs.push({ label: "Why It Matters" })
    return crumbs
  }
  if (first === "self-discovery") {
    crumbs.push({ label: "Self Discovery" })
    return crumbs
  }
  if (first === "settings") {
    crumbs.push({ label: "Settings" })
    return crumbs
  }
  if (first === "next-steps") {
    crumbs.push({ label: "Next Steps" })
    return crumbs
  }
  if (first === "problems") {
    if (segments.length === 1) {
      crumbs.push({ label: "Problems" })
      return crumbs
    }
    if (second === "identify") {
      crumbs.push({ label: "Problems", href: "/problems" })
      crumbs.push({ label: "Identify" })
      return crumbs
    }
    const problem = problems.find((p) => p.id === Number(second))
    const name = problem?.description?.trim() || `Problem #${second}`
    crumbs.push({ label: "Problems", href: "/problems" })
    if (third === "validation") {
      crumbs.push({ label: name, href: `/problems/${second}`, truncate: true })
      crumbs.push({ label: "Validation" })
    } else {
      crumbs.push({ label: name, truncate: true })
    }
    return crumbs
  }
  if (first === "solutions") {
    if (segments.length === 1) {
      crumbs.push({ label: "Solutions" })
      return crumbs
    }
    if (second === "discover") {
      crumbs.push({ label: "Solutions", href: "/solutions" })
      crumbs.push({ label: "Discovery" })
      return crumbs
    }
    const solution = solutions.find((s) => s.id === Number(second))
    const name = solution?.title?.trim() || `Solution #${second}`
    crumbs.push({ label: "Solutions", href: "/solutions" })
    if (third === "validate") {
      crumbs.push({ label: name, href: `/solutions/${second}`, truncate: true })
      crumbs.push({ label: "Validation" })
    } else {
      crumbs.push({ label: name, truncate: true })
    }
    return crumbs
  }
  return crumbs
}

function isFocusFlowPath(pathname: string): boolean {
  return pathname.startsWith("/self-discovery/discover")
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [guidanceOpen, setGuidanceOpen] = useState(false)
  const [guidanceTopic, setGuidanceTopic] = useState<string | undefined>(undefined)
  const isMobile = useIsMobile()

  const fullView = useSelector((state: RootState) => state.settings.fullView)
  const journalOpen = useSelector((state: RootState) => state.settings.journalOpen)
  const problems = useSelector((state: RootState) => state.problems.problems)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const dispatch = useDispatch<AppDispatch>()

  const crumbs = getCrumbs(pathname, problems, solutions)

  const isFocusFlow = isFocusFlowPath(pathname)
  const [topNavOpen, setTopNavOpen] = useState(false)

  useEffect(() => {
    if (!isFocusFlow) {
      setTopNavOpen(false)
    }
  }, [isFocusFlow])

  const openGuidance = (topic?: string) => {
    setGuidanceTopic(topic)
    setGuidanceOpen(true)
    dispatch.settings.setJournalOpen(false)
    setTopNavOpen(false)
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
    setTopNavOpen(false)
  }

  const closeJournal = () => dispatch.settings.setJournalOpen(false)

  const sidePanelOpen = !isMobile && (guidanceOpen || journalOpen)

  // Load persisted settings from localStorage on mount
  useEffect(() => {
    dispatch.settings.init()
    dispatch.selfDiscoveryItems.init()
    dispatch.customDimensionItems.init()
    dispatch.problems.init()
    dispatch.accountSettings.init()
    dispatch.solutions.init()
    dispatch.solutionWorkspaces.init()
    dispatch.notes.init()
    dispatch.problemCandidates.init()
    dispatch.reflectSessions.init()
  }, [dispatch.settings, dispatch.selfDiscoveryItems, dispatch.customDimensionItems, dispatch.problems, dispatch.accountSettings, dispatch.solutions, dispatch.solutionWorkspaces, dispatch.notes, dispatch.problemCandidates, dispatch.reflectSessions])

  const headerTitle = (
    <Breadcrumb className="ml-2 min-w-0">
      <BreadcrumbList className="text-sm font-semibold flex-nowrap">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1
          const truncateClass = crumb.truncate ? "block max-w-[20ch] truncate" : ""
          const titleAttr = crumb.truncate ? crumb.label : undefined
          return (
            <React.Fragment key={`${crumb.label}-${idx}`}>
              {idx > 0 && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
              <BreadcrumbItem className="min-w-0">
                {isLast || !crumb.href ? (
                  <BreadcrumbPage className={`font-bold ${truncateClass}`} title={titleAttr}>
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className="font-semibold">
                    <Link href={crumb.href} className={truncateClass} title={titleAttr}>
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )

  const activeNavItem = navigationItems.topMenu.find((item) =>
    item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)
  )
  const ActiveNavIcon = activeNavItem?.icon

  const headerNav = (
    <>
      <nav className="hidden lg:flex items-center gap-1">
        {navigationItems.topMenu.map((item) => {
          const isActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)
          return (
            <Tooltip key={item.url}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "secondary-brand" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  asChild
                >
                  <Link href={item.url} aria-label={item.title} onClick={() => setTopNavOpen(false)}>
                    <item.icon className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{item.title}</TooltipContent>
            </Tooltip>
          )
        })}
      </nav>
      <div className="lg:hidden">
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={activeNavItem ? "secondary-brand" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Open navigation menu"
                >
                  {ActiveNavIcon ? <ActiveNavIcon className="h-4 w-4" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Navigation</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            {navigationItems.topMenu.map((item) => {
              const isActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)
              return (
                <DropdownMenuItem key={item.url} asChild className={isActive ? "bg-accent text-accent-foreground" : ""}>
                  <Link href={item.url} onClick={() => setTopNavOpen(false)}>
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )

  const headerActions = (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={journalOpen ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={toggleJournal}
            aria-pressed={journalOpen}
            aria-label="Toggle journal"
          >
            <NotebookText />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Journal</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={guidanceOpen ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={toggleGuidance}
            aria-pressed={guidanceOpen}
            aria-label="Toggle guidance"
          >
            <HelpCircle />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Guidance</TooltipContent>
      </Tooltip>
      <Button variant="outline" size="icon" asChild>
        <Link href="/settings" onClick={() => setTopNavOpen(false)}>
          <Settings />
        </Link>
      </Button>
    </>
  )

  const brandLogo = (
    <Link
      href="/"
      className="flex items-center gap-2 h-8 px-2 lg:px-3 rounded-md bg-quaternary text-quaternary-foreground shrink-0"
      aria-label="Navigate home"
    >
      <Compass className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="text-base font-semibold hidden lg:inline">Navigate</span>
    </Link>
  )

  return (
    <TooltipProvider delayDuration={0}>
    <div className="flex h-svh w-full flex-col overflow-hidden">
      <div className="relative flex w-full min-w-0 flex-1 flex-col bg-background">
        {!fullView && !isFocusFlow && (
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {brandLogo}
            <Separator orientation="vertical" className="h-4" />
            {headerTitle}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:block">
              <TeamAvatars />
            </div>
            {headerNav}
            <Separator orientation="vertical" className="h-4" />
            {headerActions}
          </div>
        </header>
        )}
        <FocusChromeContext.Provider value={{ revealTopNav: () => setTopNavOpen(true) }}>
        <GuidanceProvider onOpen={openGuidance}>
          {sidePanelOpen ? (
            <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
              <ResizablePanel defaultSize={70} minSize={40}>
                <div className="h-full bg-background overflow-y-auto">
                  {isFocusFlow ? (
                    <div className="flex min-h-full w-full flex-col">
                      <ContentArea>{children}</ContentArea>
                    </div>
                  ) : (
                    <div className={`relative isolate mx-auto flex min-h-full w-full max-w-screen-2xl flex-col gap-4 ${fullView ? "px-6 py-6" : "px-4 py-6 sm:px-6 lg:px-8 lg:py-8"}`}>
                      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                        <img
                          src="/illustrations/02-compass.svg"
                          alt=""
                          className="select-none absolute -right-48 -bottom-48 w-[220rem] opacity-10 rotate-12 origin-bottom-right"
                        />
                      </div>
                      <ContentArea>{children}</ContentArea>
                    </div>
                  )}
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
            <div className="flex-1 min-h-0 bg-background overflow-y-auto">
              {isFocusFlow ? (
                <div className="flex min-h-full w-full flex-col">
                  <ContentArea>{children}</ContentArea>
                </div>
              ) : (
                <div className={`relative isolate mx-auto flex min-h-full w-full max-w-screen-2xl flex-col gap-4 ${fullView ? "px-6 py-6" : "px-4 py-6 sm:px-6 lg:px-8 lg:py-8"}`}>
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <img
                      src="/illustrations/02-compass.svg"
                      alt=""
                      className="select-none absolute -right-48 -bottom-48 w-[220rem] opacity-10 rotate-12 origin-bottom-right"
                    />
                  </div>
                  <ContentArea>{children}</ContentArea>
                </div>
              )}
            </div>
          )}
        </GuidanceProvider>
        </FocusChromeContext.Provider>
      </div>
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
      {isFocusFlow && (
        <Sheet open={topNavOpen} onOpenChange={setTopNavOpen}>
          <SheetContent side="top" className="p-0">
            <VisuallyHidden>
              <SheetTitle>App header</SheetTitle>
            </VisuallyHidden>
            <header className="flex h-16 items-center justify-between gap-2 px-4 sm:px-6">
              <div className="flex items-center gap-2 min-w-0">
                {brandLogo}
                <Separator orientation="vertical" className="h-4" />
                {headerTitle}
              </div>
              <div className="flex items-center gap-2 shrink-0 pr-10">
                <div className="hidden md:block">
                  <TeamAvatars />
                </div>
                {headerNav}
                <Separator orientation="vertical" className="h-4" />
                {headerActions}
              </div>
            </header>
          </SheetContent>
        </Sheet>
      )}
      <Toaster />
    </div>
    </TooltipProvider>
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

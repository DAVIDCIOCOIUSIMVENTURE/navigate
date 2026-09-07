"use client"

import React from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Settings, HelpCircle, NotebookText, Compass, User, UserCircle, ShieldCheck } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { AVATAR_COLOR_OPTIONS } from "@/lib/avatar-colors"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
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
type Crumb = { label: string; href?: string }

function getCrumbs(pathname: string): Crumb[] {
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
  if (first === "portfolios") {
    if (segments.length === 1) {
      crumbs.push({ label: "Portfolios" })
      return crumbs
    }
    crumbs.push({ label: "Portfolios", href: "/portfolios" })
    if (second === "new") {
      crumbs.push({ label: "New" })
    } else if (third === "edit") {
      crumbs.push({ label: second, href: `/portfolios/${second}` })
      crumbs.push({ label: "Edit" })
    } else {
      crumbs.push({ label: second })
    }
    return crumbs
  }
  if (first === "admin") {
    if (segments.length === 1) {
      crumbs.push({ label: "Admin" })
      return crumbs
    }
    crumbs.push({ label: "Admin", href: "/admin" })
    if (second === "users" && third) {
      crumbs.push({ label: "User" })
    } else if (second) {
      crumbs.push({ label: second })
    }
    return crumbs
  }
  if (first === "problems") {
    if (segments.length === 1) {
      crumbs.push({ label: "Problems" })
      return crumbs
    }
    if (second === "identify") {
      crumbs.push({ label: "Problems", href: "/problems" })
      if (third === "canvas-builder") {
        crumbs.push({ label: "Identify", href: "/problems/identify" })
        crumbs.push({ label: "Canvas Builder" })
      } else if (third === "reflect") {
        crumbs.push({ label: "Identify", href: "/problems/identify" })
        crumbs.push({ label: "Reflect" })
      } else if (third === "research") {
        crumbs.push({ label: "Identify", href: "/problems/identify" })
        crumbs.push({ label: "Research" })
      } else {
        crumbs.push({ label: "Identify" })
      }
      return crumbs
    }
    crumbs.push({ label: "Problems", href: "/problems" })
    if (third === "explore") {
      crumbs.push({ label: second, href: `/problems/${second}` })
      crumbs.push({ label: "Explore" })
    } else if (third === "validation") {
      crumbs.push({ label: second, href: `/problems/${second}` })
      crumbs.push({ label: "Validation" })
    } else if (third === "edit") {
      crumbs.push({ label: second, href: `/problems/${second}` })
      crumbs.push({ label: "Edit" })
    } else {
      crumbs.push({ label: second })
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
    if (second === "identify") {
      crumbs.push({ label: "Solutions", href: "/solutions" })
      crumbs.push({ label: "Identify" })
      return crumbs
    }
    crumbs.push({ label: "Solutions", href: "/solutions" })
    if (third === "validate") {
      crumbs.push({ label: second, href: `/solutions/${second}` })
      crumbs.push({ label: "Validation" })
    } else if (third === "edit") {
      crumbs.push({ label: second, href: `/solutions/${second}` })
      crumbs.push({ label: "Edit" })
    } else {
      crumbs.push({ label: second })
    }
    return crumbs
  }
  return crumbs
}

function isFocusFlowPath(pathname: string): boolean {
  return (
    pathname.startsWith("/self-discovery/discover") ||
    pathname.startsWith("/problems/identify/reflect") ||
    pathname.startsWith("/problems/identify/research") ||
    pathname.startsWith("/solutions/discover")
  )
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [guidanceOpen, setGuidanceOpen] = useState(false)
  const [guidanceTopic, setGuidanceTopic] = useState<string | undefined>(undefined)
  const isMobile = useIsMobile()

  const fullView = useSelector((state: RootState) => state.settings.fullView)
  const journalOpen = useSelector((state: RootState) => state.settings.journalOpen)
  const avatarColor = useSelector((state: RootState) => state.settings.avatarColor)
  const sidebarMode = useSelector((state: RootState) => state.settings.sidebarMode)
  const dispatch = useDispatch<AppDispatch>()
  const activeAvatarColor = AVATAR_COLOR_OPTIONS.find((c) => c.id === avatarColor) ?? AVATAR_COLOR_OPTIONS[0]

  const crumbs = getCrumbs(pathname)

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
    dispatch.researchSessions.init()
    dispatch.portfolios.init()
  }, [dispatch])

  const headerTitle = (
    <Breadcrumb className="ml-2 min-w-0">
      <BreadcrumbList className="text-sm lg:text-base font-semibold flex-nowrap [&_span]:text-quaternary-foreground [&_a]:text-quaternary-foreground/80 [&_a:hover]:text-quaternary-foreground [&_li[role=presentation]]:text-quaternary-foreground/60">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1
          return (
            <React.Fragment key={`${crumb.label}-${idx}`}>
              {idx > 0 && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage className="font-bold">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className="font-semibold">
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )

  const panelButtonClass = (active: boolean) =>
    cn(
      "h-8 w-8 text-quaternary-foreground hover:bg-quaternary-foreground/10 hover:text-quaternary-foreground",
      active && "bg-white text-quaternary hover:bg-white hover:text-quaternary",
    )
  const panelToggles = (
    <div className="flex items-center gap-1 shrink-0">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle journal"
            aria-pressed={journalOpen}
            className={panelButtonClass(journalOpen)}
            onClick={toggleJournal}
          >
            <NotebookText className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Journal</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle guidance"
            aria-pressed={guidanceOpen}
            className={panelButtonClass(guidanceOpen)}
            onClick={toggleGuidance}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Guidance</TooltipContent>
      </Tooltip>
    </div>
  )

  const headerActions = (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "h-10 w-10 rounded-full text-white flex items-center justify-center shrink-0 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-opacity ring-2 ring-quaternary-foreground/40",
                activeAvatarColor.bgClass,
              )}
              aria-label="Open user menu"
            >
              <User className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Account</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/settings/account" onClick={() => setTopNavOpen(false)}>
            <UserCircle className="h-4 w-4" />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" onClick={() => setTopNavOpen(false)}>
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const brandLogo = (
    <Link
      href="/"
      className="flex items-center gap-2 h-8 px-2 md:px-3 rounded-md bg-white/10 text-quaternary-foreground hover:bg-white/20 transition-colors shrink-0"
      aria-label="Navigate home"
    >
      <Compass className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      <span className="text-base font-semibold hidden md:inline">Navigate</span>
    </Link>
  )

  return (
    <TooltipProvider delayDuration={0}>
    <SidebarProvider
      sidebarMode={sidebarMode}
      onSidebarModeChange={(mode) => dispatch.settings.setSidebarMode(mode)}
      className="h-svh flex-col overflow-hidden"
    >
      {!fullView && !isFocusFlow && (
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-quaternary/30 bg-quaternary px-4 justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {brandLogo}
            <SidebarTrigger className="shrink-0 text-quaternary-foreground hover:bg-white/10 hover:text-quaternary-foreground" />
            <Separator orientation="vertical" className="h-4 bg-quaternary-foreground/30" />
            {headerTitle}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className={cn("h-8 gap-2 text-white", pathname.startsWith("/admin") && "ring-2 ring-white/70")}
                  asChild
                >
                  <Link href="/admin" aria-label="Admin panel">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="hidden md:inline">Admin panel</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Admin panel</TooltipContent>
            </Tooltip>
            <div className="hidden md:block">
              <TeamAvatars />
            </div>
            {panelToggles}
            <Separator orientation="vertical" className="h-4 bg-quaternary-foreground/30" />
            {headerActions}
          </div>
        </header>
        )}
        <div className="flex w-full min-h-0 flex-1">
        {!fullView && !isFocusFlow && <AppSidebar />}
        <div className="relative flex w-full min-w-0 min-h-0 flex-1 flex-col bg-background">
        <FocusChromeContext.Provider value={{ revealTopNav: () => setTopNavOpen(true) }}>
        <GuidanceProvider onOpen={openGuidance}>
          {sidePanelOpen ? (
            <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
              <ResizablePanel defaultSize={60} minSize={40}>
                <div className="h-full bg-background overflow-y-auto">
                  {isFocusFlow ? (
                    <div className="flex min-h-full w-full flex-col">
                      <ContentArea>{children}</ContentArea>
                    </div>
                  ) : (
                    <div className={`relative isolate mx-auto flex min-h-full w-full max-w-screen-2xl flex-col gap-4 ${fullView ? "px-6 py-6" : "px-4 py-6 sm:px-6 lg:px-8 lg:py-8"}`}>
                      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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
              <ResizablePanel defaultSize={40} minSize={40} maxSize={60}>
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
          <SheetContent side="top" className="p-0 bg-quaternary border-b border-quaternary/30 [&>button]:text-quaternary-foreground">
            <VisuallyHidden>
              <SheetTitle>App header</SheetTitle>
            </VisuallyHidden>
            <header className="flex h-16 items-center justify-between gap-2 px-4 sm:px-6">
              <div className="flex items-center gap-2 min-w-0">
                {brandLogo}
                <Separator orientation="vertical" className="h-4 bg-quaternary-foreground/30" />
                {headerTitle}
              </div>
              <div className="flex items-center gap-2 shrink-0 pr-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className={cn("h-8 gap-2 text-white", pathname.startsWith("/admin") && "ring-2 ring-white/70")}
                      asChild
                    >
                      <Link href="/admin" aria-label="Admin panel" onClick={() => setTopNavOpen(false)}>
                        <ShieldCheck className="h-4 w-4" />
                        <span className="hidden md:inline">Admin panel</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Admin panel</TooltipContent>
                </Tooltip>
                <div className="hidden md:block">
                  <TeamAvatars />
                </div>
                {panelToggles}
                <Separator orientation="vertical" className="h-4 bg-quaternary-foreground/30" />
                {headerActions}
              </div>
            </header>
          </SheetContent>
        </Sheet>
      )}
      <Toaster />
    </SidebarProvider>
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

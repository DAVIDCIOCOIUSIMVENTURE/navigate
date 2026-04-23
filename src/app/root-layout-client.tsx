"use client"

import React from "react"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Settings, HelpCircle, NotebookText } from "lucide-react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { JournalPanel } from "@/components/journal-panel"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { GuidanceDialog } from "@/components/guidance-dialog"
import { GuidanceProvider } from "@/context/guidance-context"
import { AppStoreProvider } from "@/store/provider"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { Toaster } from "@/components/ui/sonner"
import { TeamAvatars } from "@/components/team-avatars"
import Link from "next/link"
function generateBreadcrumbs(pathname: string) {
  const paths = pathname.split('/').filter(Boolean)

  return paths.map((path, index) => {
    const href = `/${paths.slice(0, index + 1).join('/')}`
    const label = path.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')

    return {
      href,
      label,
      isLast: index === paths.length - 1,
    }
  })
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)
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
    dispatch.notes.init()
  }, [dispatch.settings, dispatch.problemTriggers, dispatch.problems, dispatch.accountSettings, dispatch.solutions, dispatch.notes])

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
            <Breadcrumb >
              <BreadcrumbList>
                {breadcrumbs.map((crumb) => (
                  <React.Fragment key={crumb.href}>
                    <BreadcrumbItem>
                      {crumb.isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!crumb.isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
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
                  <div className="flex flex-1 w-full min-h-0">
                    {children}
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={30} minSize={20} maxSize={60}>
                <JournalPanel onClose={() => dispatch.settings.setJournalOpen(false)} />
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <div className={`flex flex-1 flex-col gap-4 bg-gray-100 min-h-0 overflow-y-auto ${fullView ? "px-6 py-6" : "px-4 py-6 sm:px-6 lg:px-12 lg:py-10"}`}>
              <div className="flex flex-1 w-full min-h-0">
                {children}
              </div>
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
      <LayoutContent>{children}</LayoutContent>
    </AppStoreProvider>
  )
}

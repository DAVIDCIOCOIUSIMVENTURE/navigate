"use client"

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
import { Settings, HelpCircle } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { GuidanceDialog } from "@/components/guidance-dialog"
import { AppStoreProvider } from "@/store/provider"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { InnovationProvider } from "@/context/innovation-context"
import { IdeasProvider, useIdeas } from "@/context/ideas-context"

function generateBreadcrumbs(pathname: string, getIdeaTitle: (id: number) => string | undefined) {
  const paths = pathname.split('/').filter(Boolean)

  return paths.map((path, index) => {
    const href = `/${paths.slice(0, index + 1).join('/')}`

    // If this segment is a numeric idea ID, resolve it to the idea title
    const numericId = /^\d+$/.test(path) ? Number(path) : null
    const resolvedTitle = numericId ? getIdeaTitle(numericId) : undefined
    const label = resolvedTitle ?? path.split('-').map(word =>
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
  const { getIdea } = useIdeas()
  const breadcrumbs = generateBreadcrumbs(pathname, (id) => getIdea(id)?.title)
  const [guidanceOpen, setGuidanceOpen] = useState(false)

  const sidebarMode = useSelector((state: RootState) => state.settings.sidebarMode)
  const dispatch = useDispatch<AppDispatch>()

  // Load persisted settings from localStorage on mount
  useEffect(() => {
    dispatch.settings.init()
    dispatch.problemTriggers.init()
  }, [])

  return (
    <SidebarProvider
      sidebarMode={sidebarMode}
      onSidebarModeChange={(mode) => dispatch.settings.setSidebarMode(mode)}
    >
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb >
              <BreadcrumbList>
                {breadcrumbs.map((crumb) => (
                  <BreadcrumbItem key={crumb.href} >
                    {crumb.isLast ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <>
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                        <BreadcrumbSeparator />
                      </>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex flex-row items-center gap-2 justify-center" onClick={() => setGuidanceOpen(true)}>
              <HelpCircle />
              <span>Guidance</span>
            </Button>
            <Button variant="outline" size="icon">
              <Settings />
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-8 bg-gray-100">
          <div className="max-w-7xl mx-auto flex flex-1 w-full">
            {children}
          </div>
        </div>
      </SidebarInset>
      <GuidanceDialog open={guidanceOpen} onOpenChange={setGuidanceOpen} />
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
      <IdeasProvider>
        <InnovationProvider>
          <LayoutContent>{children}</LayoutContent>
        </InnovationProvider>
      </IdeasProvider>
    </AppStoreProvider>
  )
}

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
import { Settings } from "lucide-react"
import { usePathname } from "next/navigation"

function generateBreadcrumbs(pathname: string) {
  // 1. Split the path and remove empty strings
  const paths = pathname.split('/').filter(Boolean)
  
  // 2. Map each path segment into a breadcrumb object
  const breadcrumbs = paths.map((path, index) => {
    // Create the full URL up to this segment
    const href = `/${paths.slice(0, index + 1).join('/')}`
    
    // Format the label: "self-discovery" -> "Self Discovery"
    const label = path.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
    
    return {
      href,    // e.g., "/self-discovery"
      label,   // e.g., "Self Discovery"
      isLast: index === paths.length - 1  // true for last segment
    }
  })

  return breadcrumbs
}

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)

  return (
    <SidebarProvider>
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
          <Button variant="outline" size="icon">
            <Settings />
          </Button>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-8 bg-gray-100">
          <div className="max-w-7xl mx-auto flex flex-1 w-full">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 
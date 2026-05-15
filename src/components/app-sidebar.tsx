"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { navigationItems } from "@/config/navigation"
import { Compass, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const activeMenuClass =
  "active:bg-white/10 active:text-sidebar-foreground data-[active=true]:bg-white data-[active=true]:text-black data-[active=true]:hover:bg-white data-[active=true]:active:bg-white data-[active=true]:active:text-black"

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="px-6 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-4">
        <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground shrink-0">
            <Compass className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold group-data-[collapsible=icon]:hidden">Navigate</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-4 group-data-[collapsible=icon]:px-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard" isActive={pathname === "/"} className={activeMenuClass}>
                  <Link href="/" className="transition-colors">
                    <div className="flex items-center justify-center w-6 h-6 rounded-md">
                      <LayoutDashboard className="h-4 w-4" />
                    </div>
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Innovation Process</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.innovation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={pathname.startsWith(item.url)} className={activeMenuClass}>
                    <Link href={item.url} className="transition-colors">
                      <div className="flex items-center justify-center w-6 h-6 rounded-md">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

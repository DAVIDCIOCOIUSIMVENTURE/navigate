"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { navigationItems } from "@/config/navigation"
import { TOUR_TARGETS } from "@/lib/tour-steps"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="!top-16 h-[calc(100svh-4rem)]">
      <SidebarContent className="pt-4 lg:pt-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.sidebar.map((item) => {
                const isActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                      className="h-9 text-base active:bg-white/20 active:text-sidebar-foreground data-[active=true]:bg-white data-[active=true]:text-quaternary data-[active=true]:hover:bg-white data-[active=true]:hover:text-quaternary"
                    >
                      <Link href={item.url} className="transition-colors" data-tour={TOUR_TARGETS.sidebarItem(item.url)}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

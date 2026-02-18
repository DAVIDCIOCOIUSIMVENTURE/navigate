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
import { CustomRocket } from "@/components/icons/custom-rocket"
import { LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { JournalDialog } from "./journal-dialog"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="px-6 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-4">
        <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0">
            <CustomRocket className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold group-data-[collapsible=icon]:hidden">Navigate</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-4 group-data-[collapsible=icon]:px-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <Link href="/" className="hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-center w-6 h-6 rounded-md">
                      <LayoutDashboard className="h-4 w-4" />
                    </div>
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {navigationItems.selfDiscovery.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url} className="hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-center w-6 h-6 rounded-md">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <JournalDialog />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Problem Discovery</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.problemDiscovery.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url} className="hover:bg-accent/50 transition-colors">
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

        <SidebarGroup>
          <SidebarGroupLabel>Solution</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.solution.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url} className="hover:bg-accent/50 transition-colors">
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

"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Palette, Bell, Shield, Route } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_ITEM_ACTIVE_CLASS, NAV_ITEM_HOVER_CLASS, navIconClass, navIconTileClass } from "@/lib/nav-item-styles"

const SETTINGS_NAV: { path: string; label: string; icon: LucideIcon; disabled?: boolean }[] = [
  { path: "account", label: "Account", icon: User },
  { path: "appearance", label: "Appearance", icon: Palette, disabled: true },
  { path: "notifications", label: "Notifications", icon: Bell, disabled: true },
  { path: "data-privacy", label: "Data & Privacy", icon: Shield },
  { path: "guided-tour", label: "Guided tour", icon: Route },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="flex gap-6 flex-1 w-full items-start">
      <div className="w-56 sticky top-0 flex flex-col gap-3 shrink-0">
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col gap-1">
              {SETTINGS_NAV.map((item) => {
                const isActive = pathname === `/settings/${item.path}`
                const Icon = item.icon
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    disabled={item.disabled}
                    aria-disabled={item.disabled}
                    title={item.disabled ? "Coming soon" : undefined}
                    className={cn(
                      "w-full justify-start h-auto whitespace-normal text-left py-1.5 gap-2",
                      NAV_ITEM_HOVER_CLASS,
                      isActive && NAV_ITEM_ACTIVE_CLASS,
                    )}
                    onClick={() => {
                      if (item.disabled) return
                      router.push(`/settings/${item.path}`)
                    }}
                  >
                    <span className={navIconTileClass(isActive)}>
                      <Icon className={navIconClass(isActive)} aria-hidden="true" />
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.disabled && (
                      <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wide shrink-0">
                        Soon
                      </span>
                    )}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 max-w-2xl">{children}</div>
    </div>
  )
}

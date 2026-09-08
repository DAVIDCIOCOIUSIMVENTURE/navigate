"use client"

import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { getFoundationsSectionIcon } from "@/config/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { ChevronDown, BookOpen, type LucideIcon } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { NAV_ITEM_ACTIVE_CLASS, NAV_ITEM_HOVER_CLASS, navIconClass, navIconTileClass } from "@/lib/nav-item-styles"
import { FOUNDATIONS_SECTIONS } from "@/data/foundationsData"
import { useContainerSize } from "@/context/container-size-context"

function NavContent({
    pathname,
    onNavigate,
}: {
    pathname: string
    onNavigate: (path: string) => void
}) {
    const renderItem = (isActive: boolean, Icon: LucideIcon, label: string, href: string) => (
        <Button
            variant="ghost"
            className={cn(
                "w-full justify-start h-auto whitespace-normal text-left py-1.5 gap-2",
                NAV_ITEM_HOVER_CLASS,
                isActive && NAV_ITEM_ACTIVE_CLASS,
            )}
            onClick={() => onNavigate(href)}
        >
            <span className={navIconTileClass(isActive)}>
                <Icon className={navIconClass(isActive)} aria-hidden="true" />
            </span>
            <span className="flex-1 text-left">{label}</span>
        </Button>
    )

    return (
        <div className="flex flex-col gap-1">
            {renderItem(pathname === "/foundations", BookOpen, "Introduction", "/foundations")}
            {FOUNDATIONS_SECTIONS.map((section) => {
                const isActive = pathname === `/foundations/${section.url}`
                const SectionIcon = getFoundationsSectionIcon(section.iconKey)
                return (
                    <div key={section.url}>
                        {renderItem(isActive, SectionIcon, section.title, `/foundations/${section.url}`)}
                    </div>
                )
            })}
        </div>
    )
}

function getActiveInfo(pathname: string): { label: string; Icon: LucideIcon } {
    if (pathname === "/foundations") {
        return { label: "Introduction", Icon: BookOpen }
    }
    for (const section of FOUNDATIONS_SECTIONS) {
        if (pathname === `/foundations/${section.url}`) {
            return {
                label: section.title,
                Icon: getFoundationsSectionIcon(section.iconKey),
            }
        }
    }
    return { label: "Why It Matters", Icon: BookOpen }
}

export default function FoundationsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    const size = useContainerSize()
    const isWide = size === "wide"

    const handleNavigate = (path: string) => {
        setMobileNavOpen(false)
        router.push(path)
    }

    const { label: activeLabel, Icon: ActiveIcon } = getActiveInfo(pathname)

    return (
        <div
            className={cn(
                "flex h-full w-full flex-1 min-h-0",
                isWide ? "flex-row gap-3 overflow-hidden max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]" : "flex-col gap-3",
            )}
        >
            {!isWide && (
                <CardTitle size="md" icon={BookOpen} className="text-xl text-foreground">Why It Matters</CardTitle>
            )}

            {!isWide && (
                <nav aria-label="Why It Matters sections" className="w-full shrink-0">
                    <Collapsible open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                        <Card>
                            <CardContent className="p-2">
                                <CollapsibleTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-between h-auto py-2 px-3"
                                    >
                                        <span className="flex items-center gap-2 text-sm font-medium min-w-0">
                                            <span className={navIconTileClass(true)}>
                                                <ActiveIcon className={navIconClass(true)} aria-hidden="true" />
                                            </span>
                                            <span className="truncate">{activeLabel}</span>
                                        </span>
                                        <ChevronDown
                                            className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${mobileNavOpen ? "rotate-180" : ""}`}
                                            aria-hidden="true"
                                        />
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-2">
                                    <div className="px-1">
                                        <NavContent pathname={pathname} onNavigate={handleNavigate} />
                                    </div>
                                </CollapsibleContent>
                            </CardContent>
                        </Card>
                    </Collapsible>
                </nav>
            )}

            {isWide && (
                <div className="flex w-72 shrink-0 flex-col gap-3 min-h-0">
                    <CardTitle size="md" icon={BookOpen} className="text-xl text-foreground">Why It Matters</CardTitle>
                    <Card className="flex-1 min-h-0 overflow-y-auto">
                        <CardContent className="p-3">
                            <div className="flex flex-col gap-1">
                                <NavContent pathname={pathname} onNavigate={handleNavigate} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="flex-1 min-h-0 min-w-0">
                {children}
            </div>
        </div>
    )
}

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { getFoundationsSectionIcon } from "@/config/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { ChevronDown, BookOpen, type LucideIcon } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { FOUNDATIONS_SECTIONS } from "@/data/foundationsData"
import { useContainerSize } from "@/context/container-size-context"

const SECTION_ICON_BG: Record<string, string> = {
    "why-the-right-idea": "bg-yellow-600",
    "why-validate-the-problem": "bg-teal-700",
    "why-validate-the-solution": "bg-blue-900",
    "the-cost-of-skipping": "bg-red-800",
    "when-it-goes-right": "bg-green-800",
}

function NavContent({
    pathname,
    onNavigate,
}: {
    pathname: string
    onNavigate: (path: string) => void
}) {
    return (
        <div className="flex flex-col gap-1">
            <Button
                variant={pathname === "/foundations" ? "secondary" : "ghost"}
                className={cn(
                    "w-full justify-start h-auto whitespace-normal text-left py-1.5 gap-2 hover:text-secondary-brand",
                    pathname === "/foundations" && "text-secondary-brand",
                )}
                onClick={() => onNavigate("/foundations")}
            >
                <span className="flex items-center justify-center w-6 h-6 rounded-md shrink-0 bg-violet-800">
                    <BookOpen className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                </span>
                <span className="flex-1 text-left">Introduction</span>
            </Button>
            {FOUNDATIONS_SECTIONS.map((section) => {
                const isActive = pathname === `/foundations/${section.url}`
                const SectionIcon = getFoundationsSectionIcon(section.iconKey)
                const bgClass = SECTION_ICON_BG[section.url] ?? "bg-primary"
                return (
                    <Button
                        key={section.url}
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                            "w-full justify-start h-auto whitespace-normal text-left py-1.5 gap-2 hover:text-secondary-brand",
                            isActive && "text-secondary-brand",
                        )}
                        onClick={() => onNavigate(`/foundations/${section.url}`)}
                    >
                        <span className={cn("flex items-center justify-center w-6 h-6 rounded-md shrink-0", bgClass)}>
                            <SectionIcon className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                        </span>
                        <span className="flex-1 text-left">{section.shortTitle}</span>
                    </Button>
                )
            })}
        </div>
    )
}

function getActiveInfo(pathname: string): { label: string; Icon: LucideIcon; bgClass: string } {
    if (pathname === "/foundations") {
        return { label: "Introduction", Icon: BookOpen, bgClass: "bg-violet-800" }
    }
    for (const section of FOUNDATIONS_SECTIONS) {
        if (pathname === `/foundations/${section.url}`) {
            return {
                label: section.shortTitle,
                Icon: getFoundationsSectionIcon(section.iconKey),
                bgClass: SECTION_ICON_BG[section.url] ?? "bg-primary",
            }
        }
    }
    return { label: "Why It Matters", Icon: BookOpen, bgClass: "bg-primary" }
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

    const { label: activeLabel, Icon: ActiveIcon, bgClass: activeBgClass } = getActiveInfo(pathname)

    return (
        <div
            className={cn(
                "flex h-full w-full flex-1 min-h-0",
                isWide ? "flex-row gap-3 overflow-hidden max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]" : "flex-col gap-3",
            )}
        >
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
                                            <span className={cn("flex items-center justify-center w-6 h-6 rounded-md shrink-0", activeBgClass)}>
                                                <ActiveIcon className="h-3.5 w-3.5 text-white" aria-hidden="true" />
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
                <Card className="w-72 overflow-y-auto shrink-0">
                    <CardContent className="p-3">
                        <div className="flex flex-col gap-1">
                            <NavContent pathname={pathname} onNavigate={handleNavigate} />
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex-1 min-h-0 min-w-0">
                {children}
            </div>
        </div>
    )
}

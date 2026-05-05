"use client"

import { Card, CardContent } from "@/components/ui/card"
import { getSelfDiscoveryCategoryIcon } from "@/config/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { PanelLeftClose, ChevronDown, Compass, type LucideIcon } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { SELF_DISCOVERY_CATEGORIES } from "@/data/selfDiscoveryData"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { useContainerSize } from "@/context/container-size-context"

const CATEGORY_ICON_BG: Record<string, string> = {
    "personal-interests": "bg-primary",
    "knowledge": "bg-primary",
    "skills-expertise": "bg-primary",
    "social-impact": "bg-primary",
    "other": "bg-primary",
}

const OTHER_CATEGORY = {
    url: "other",
    title: "Other",
    description: "Items you've added that don't fit the categories above.",
} as const

function NavContent({
    pathname,
    onNavigate,
}: {
    pathname: string
    onNavigate: (path: string) => void
}) {
    const activeCategoryUrl = SELF_DISCOVERY_CATEGORIES.find(c =>
        pathname.startsWith(`/self-discovery/${c.url}`)
    )?.url
    const isOtherActive = pathname.startsWith(`/self-discovery/${OTHER_CATEGORY.url}`)
    const [openCategory, setOpenCategory] = useState<string>(activeCategoryUrl ?? "")
    const OtherIcon = getSelfDiscoveryCategoryIcon(OTHER_CATEGORY.url) ?? Compass
    const otherBgClass = CATEGORY_ICON_BG[OTHER_CATEGORY.url] ?? "bg-primary"

    useEffect(() => {
        if (activeCategoryUrl) {
            setOpenCategory(activeCategoryUrl)
        }
    }, [activeCategoryUrl])

    return (
        <div className="flex flex-col gap-1">
            <Button
                variant={pathname === "/self-discovery" ? "secondary" : "ghost"}
                className="w-full justify-start h-auto whitespace-normal text-left py-1.5 px-3 gap-2"
                onClick={() => onNavigate("/self-discovery")}
            >
                <span className="flex items-center justify-center w-6 h-6 rounded-md shrink-0 bg-primary">
                    <Compass className="h-3.5 w-3.5 text-primary-foreground" aria-hidden="true" />
                </span>
                <span className="flex-1 text-left">Introduction</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-0" aria-hidden="true" />
            </Button>
            <Accordion
                type="single"
                collapsible
                value={openCategory}
                onValueChange={setOpenCategory}
                className="w-full flex flex-col gap-1"
            >
                {SELF_DISCOVERY_CATEGORIES.map((category) => (
                    <AccordionItem key={category.url} value={category.url}>
                        <AccordionTrigger
                            className={`w-full h-auto py-1.5 gap-4 justify-between px-3 text-sm text-left whitespace-normal rounded-md hover:no-underline ${pathname === `/self-discovery/${category.url}`
                                ? "bg-secondary text-secondary-foreground"
                                : pathname.startsWith(`/self-discovery/${category.url}/`)
                                    ? "text-foreground hover:bg-accent hover:text-primary"
                                    : "hover:bg-accent hover:text-primary"
                                }`}
                            aria-label={`${category.title} category`}
                            onClick={(e) => {
                                e.preventDefault()
                                setOpenCategory(category.url)
                                onNavigate(`/self-discovery/${category.url}`)
                            }}
                        >
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const CategoryIcon = getSelfDiscoveryCategoryIcon(category.url)
                                    const bgClass = CATEGORY_ICON_BG[category.url] ?? "bg-primary"
                                    return CategoryIcon && (
                                        <span className={cn("flex items-center justify-center w-6 h-6 rounded-md shrink-0", bgClass)}>
                                            <CategoryIcon className="h-3.5 w-3.5 text-primary-foreground" aria-hidden="true" />
                                        </span>
                                    )
                                })()}
                                {category.title}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <ul className="pl-8 pr-4 space-y-1 mt-2" role="list">
                                {category.questions.map((question) => {
                                    const isActive = pathname === `/self-discovery/${category.url}/${question.url}`
                                    return (
                                        <li
                                            key={question.url}
                                            className={cn(
                                                "text-sm cursor-pointer rounded-md px-2 py-1",
                                                isActive
                                                    ? "bg-secondary text-secondary-foreground font-medium"
                                                    : "text-muted-foreground hover:text-primary"
                                            )}
                                            onClick={() => onNavigate(`/self-discovery/${category.url}/${question.url}`)}
                                            role="menuitem"
                                            aria-current={isActive ? "page" : undefined}
                                        >
                                            {question.title}
                                        </li>
                                    )
                                })}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <Button
                variant={isOtherActive ? "secondary" : "ghost"}
                className="w-full justify-start h-auto whitespace-normal text-left py-1.5 px-3 gap-2"
                onClick={() => onNavigate(`/self-discovery/${OTHER_CATEGORY.url}`)}
            >
                <span className={cn("flex items-center justify-center w-6 h-6 rounded-md shrink-0", otherBgClass)}>
                    <OtherIcon className="h-3.5 w-3.5 text-primary-foreground" aria-hidden="true" />
                </span>
                <span className="flex-1 text-left">{OTHER_CATEGORY.title}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-0" aria-hidden="true" />
            </Button>
        </div>
    )
}

function getActiveInfo(pathname: string): { label: string; Icon: LucideIcon; bgClass: string } {
    if (pathname === "/self-discovery") {
        return { label: "Introduction", Icon: Compass, bgClass: "bg-primary" }
    }
    if (pathname.startsWith(`/self-discovery/${OTHER_CATEGORY.url}`)) {
        const OtherIcon = getSelfDiscoveryCategoryIcon(OTHER_CATEGORY.url) ?? Compass
        return {
            label: OTHER_CATEGORY.title,
            Icon: OtherIcon,
            bgClass: CATEGORY_ICON_BG[OTHER_CATEGORY.url] ?? "bg-primary",
        }
    }
    for (const category of SELF_DISCOVERY_CATEGORIES) {
        if (pathname.startsWith(`/self-discovery/${category.url}`)) {
            const CategoryIcon = getSelfDiscoveryCategoryIcon(category.url) ?? Compass
            const bgClass = CATEGORY_ICON_BG[category.url] ?? "bg-primary"
            const matchedQuestion = category.questions.find(q =>
                pathname === `/self-discovery/${category.url}/${q.url}`
            )
            return {
                label: matchedQuestion?.title ?? category.title,
                Icon: CategoryIcon,
                bgClass,
            }
        }
    }
    return { label: "Self Discovery", Icon: Compass, bgClass: "bg-primary" }
}

export default function SelfDiscoveryLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    const size = useContainerSize()
    const isWide = size === "wide"

    const triggers = useSelector((state: RootState) => state.selfDiscoveryItems.items)
    const customYouItems = useSelector((state: RootState) => state.customBrainstormItems.byColumn.you ?? [])

    const handleNavigate = (path: string) => {
        setMobileNavOpen(false)
        router.push(path)
    }

    const { label: activeLabel, Icon: ActiveIcon, bgClass: activeBgClass } = getActiveInfo(pathname)

    const showAllButton = (
        <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => setIsOpen(true)}
        >
            <PanelLeftClose className="h-3.5 w-3.5 shrink-0" />
            Show all self discovery items
        </Button>
    )

    return (
        <div
            className={cn(
                "flex h-full w-full flex-1 min-h-0",
                isWide ? "flex-row gap-3 overflow-hidden" : "flex-col gap-3",
            )}
        >
                {!isWide && (
                    <nav aria-label="Self discovery sections" className="w-full shrink-0">
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
                                                    <ActiveIcon className="h-3.5 w-3.5 text-primary-foreground" aria-hidden="true" />
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
                                        <div className="pb-2 mb-1 border-b px-1">
                                            {showAllButton}
                                        </div>
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
                                <div className="pb-3 mb-1 border-b">
                                    {showAllButton}
                                </div>
                                <NavContent pathname={pathname} onNavigate={handleNavigate} />
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex-1 min-h-0 min-w-0">
                    {children}
                </div>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Self Discovery Overview</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
                        <div className="flex flex-col gap-6 pr-4">
                            {SELF_DISCOVERY_CATEGORIES.map((category) => (
                                <div key={category.url} className="space-y-2">
                                    <h4 className="font-medium text-sm flex items-center gap-2">
                                        {(() => {
                                            const CategoryIcon = getSelfDiscoveryCategoryIcon(category.url)
                                            return CategoryIcon && <CategoryIcon className="h-4 w-4" />
                                        })()}
                                        {category.title}
                                    </h4>

                                    <div className="flex flex-col gap-2">
                                        {category.questions.map((question) => (
                                            <div key={question.url} className="space-y-2">
                                                <p className="text-sm text-muted-foreground">{question.title}</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {triggers
                                                        .filter(trigger => trigger.questionUrl === question.url)
                                                        .map((trigger) => (
                                                            <div
                                                                key={trigger.id}
                                                                className="text-xs bg-secondary text-secondary-foreground rounded-md px-3 py-1.5"
                                                            >
                                                                {trigger.title}
                                                            </div>
                                                        ))}
                                                    {triggers.filter(trigger => trigger.questionUrl === question.url).length === 0 && (
                                                        <p className="text-xs text-muted-foreground col-span-2">No triggers added yet</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                    {(() => {
                                        const OtherIcon = getSelfDiscoveryCategoryIcon(OTHER_CATEGORY.url)
                                        return OtherIcon && <OtherIcon className="h-4 w-4" />
                                    })()}
                                    {OTHER_CATEGORY.title}
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {customYouItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="text-xs bg-secondary text-secondary-foreground rounded-md px-3 py-1.5"
                                        >
                                            {item.label}
                                        </div>
                                    ))}
                                    {customYouItems.length === 0 && (
                                        <p className="text-xs text-muted-foreground col-span-2">No items added yet</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </div>
    )
}

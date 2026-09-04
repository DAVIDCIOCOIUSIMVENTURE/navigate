"use client"

import { Card, CardContent } from "@/components/ui/card"
import { getSelfDiscoveryCategoryIcon } from "@/config/navigation"
import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "@/lib/router"
import { ArrowLeft, ChevronDown, Compass, PanelTop, type LucideIcon } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ProgressRing } from "@/components/ui/progress-ring"
import { cn } from "@/lib/utils"
import { NAV_ITEM_ACTIVE_CLASS } from "@/lib/nav-item-styles"
import { SELF_DISCOVERY_CATEGORIES } from "@/data/selfDiscoveryData"
import { useContainerSize } from "@/context/container-size-context"
import { useFocusChrome } from "@/context/focus-chrome-context"
import type { RootState } from "@/store"
import { getSelfDiscoveryProgress } from "@/lib/self-discovery-progress"

const BASE_PATH = "/self-discovery/discover"

const OTHER_CATEGORY = {
    url: "other",
    title: "Other",
    description: "Items you've added that don't fit the categories above.",
} as const

/** Share of the self discovery questions that have at least one item against them. */
function ProgressFooter({ className }: { className?: string }) {
    const items = useSelector((state: RootState) => state.selfDiscoveryItems.items)
    const progress = useMemo(() => getSelfDiscoveryProgress(items), [items])

    return (
        <div className={cn("flex justify-center", className)}>
            <ProgressRing
                label="Progress"
                labelPosition="bottom"
                completed={progress.completed}
                total={progress.total}
                size={56}
            />
        </div>
    )
}

function NavContent({
    pathname,
    onNavigate,
}: {
    pathname: string
    onNavigate: (path: string) => void
}) {
    const activeCategoryUrl = SELF_DISCOVERY_CATEGORIES.find(c =>
        pathname.startsWith(`${BASE_PATH}/${c.url}`)
    )?.url
    const isOtherActive = pathname.startsWith(`${BASE_PATH}/${OTHER_CATEGORY.url}`)
    const [openCategory, setOpenCategory] = useState<string>(activeCategoryUrl ?? "")
    const OtherIcon = getSelfDiscoveryCategoryIcon(OTHER_CATEGORY.url) ?? Compass
    const isIntroActive = pathname === BASE_PATH

    useEffect(() => {
        if (activeCategoryUrl) {
            setOpenCategory(activeCategoryUrl)
        }
    }, [activeCategoryUrl])

    return (
        <div className="flex flex-col gap-1">
            <Button
                variant="ghost"
                className={cn(
                    "w-full justify-start h-auto whitespace-normal text-left py-1.5 px-3 gap-2",
                    isIntroActive && NAV_ITEM_ACTIVE_CLASS,
                )}
                onClick={() => onNavigate(BASE_PATH)}
            >
                <span
                    className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-md shrink-0",
                        isIntroActive ? "bg-tertiary" : "bg-tertiary/10",
                    )}
                >
                    <Compass
                        className={cn("h-3.5 w-3.5", isIntroActive ? "text-white" : "text-tertiary")}
                        aria-hidden="true"
                    />
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
                {SELF_DISCOVERY_CATEGORIES.map((category) => {
                    const isExactActive = pathname === `${BASE_PATH}/${category.url}`
                    const isDeepActive = pathname.startsWith(`${BASE_PATH}/${category.url}/`)
                    return (
                    <AccordionItem key={category.url} value={category.url}>
                        <AccordionTrigger
                            className={cn(
                                "w-full h-auto py-1.5 gap-4 justify-between px-3 text-sm text-left whitespace-normal rounded-md hover:no-underline",
                                isExactActive
                                    ? NAV_ITEM_ACTIVE_CLASS
                                    : isDeepActive
                                        ? "text-foreground hover:bg-accent"
                                        : "hover:bg-accent",
                            )}
                            aria-label={`${category.title} category`}
                            onClick={(e) => {
                                e.preventDefault()
                                setOpenCategory(category.url)
                                onNavigate(`${BASE_PATH}/${category.url}`)
                            }}
                        >
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const CategoryIcon = getSelfDiscoveryCategoryIcon(category.url)
                                    return CategoryIcon && (
                                        <span
                                            className={cn(
                                                "flex items-center justify-center w-6 h-6 rounded-md shrink-0",
                                                isExactActive ? "bg-tertiary" : "bg-tertiary/10",
                                            )}
                                        >
                                            <CategoryIcon
                                                className={cn(
                                                    "h-3.5 w-3.5",
                                                    isExactActive ? "text-white" : "text-tertiary",
                                                )}
                                                aria-hidden="true"
                                            />
                                        </span>
                                    )
                                })()}
                                {category.title}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <ul className="pl-8 pr-4 space-y-1 mt-2" role="list">
                                {category.questions.map((question) => {
                                    const isActive = pathname === `${BASE_PATH}/${category.url}/${question.url}`
                                    return (
                                        <li
                                            key={question.url}
                                            className={cn(
                                                "text-sm cursor-pointer rounded-md px-2 py-1 transition-colors",
                                                isActive
                                                    ? cn(NAV_ITEM_ACTIVE_CLASS, "font-medium")
                                                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                                            )}
                                            onClick={() => onNavigate(`${BASE_PATH}/${category.url}/${question.url}`)}
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
                    )
                })}
            </Accordion>
            <Button
                variant="ghost"
                className={cn(
                    "w-full justify-start h-auto whitespace-normal text-left py-1.5 px-3 gap-2",
                    isOtherActive && NAV_ITEM_ACTIVE_CLASS,
                )}
                onClick={() => onNavigate(`${BASE_PATH}/${OTHER_CATEGORY.url}`)}
            >
                <span
                    className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-md shrink-0",
                        isOtherActive ? "bg-tertiary" : "bg-tertiary/10",
                    )}
                >
                    <OtherIcon
                        className={cn("h-3.5 w-3.5", isOtherActive ? "text-white" : "text-tertiary")}
                        aria-hidden="true"
                    />
                </span>
                <span className="flex-1 text-left">{OTHER_CATEGORY.title}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-0" aria-hidden="true" />
            </Button>
        </div>
    )
}

function getActiveInfo(pathname: string): { label: string; Icon: LucideIcon } {
    if (pathname === BASE_PATH) {
        return { label: "Introduction", Icon: Compass }
    }
    if (pathname.startsWith(`${BASE_PATH}/${OTHER_CATEGORY.url}`)) {
        const OtherIcon = getSelfDiscoveryCategoryIcon(OTHER_CATEGORY.url) ?? Compass
        return { label: OTHER_CATEGORY.title, Icon: OtherIcon }
    }
    for (const category of SELF_DISCOVERY_CATEGORIES) {
        if (pathname.startsWith(`${BASE_PATH}/${category.url}`)) {
            const CategoryIcon = getSelfDiscoveryCategoryIcon(category.url) ?? Compass
            const matchedQuestion = category.questions.find(q =>
                pathname === `${BASE_PATH}/${category.url}/${q.url}`
            )
            return { label: matchedQuestion?.title ?? category.title, Icon: CategoryIcon }
        }
    }
    return { label: "Self Discovery", Icon: Compass }
}

export default function SelfDiscoveryFlowLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [mobileNavOpen, setMobileNavOpen] = useState(false)
    const { revealTopNav } = useFocusChrome()

    const size = useContainerSize()
    const isWide = size === "wide"

    const handleNavigate = (path: string) => {
        setMobileNavOpen(false)
        router.push(path)
    }

    const handleExit = () => {
        router.push("/self-discovery")
    }

    const { label: activeLabel, Icon: ActiveIcon } = getActiveInfo(pathname)

    const chromeTriggers = (
        <div className="flex items-center gap-1 shrink-0">
            <Button
                variant="outline"
                size="icon"
                onClick={revealTopNav}
                aria-label="Show top bar"
                title="Top bar"
            >
                <PanelTop className="h-4 w-4" />
            </Button>
        </div>
    )

    const inlineHeaderRow = (
        <div className="flex items-center gap-3 shrink-0">
            <Button variant="tertiary-outline" onClick={handleExit} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>
            {chromeTriggers}
            <h1 className="flex items-center gap-2 text-xl font-bold min-w-0">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-tertiary shrink-0" aria-hidden="true">
                    <Compass className="h-4 w-4 text-tertiary-foreground" />
                </span>
                <span className="truncate">Self Discovery</span>
            </h1>
        </div>
    )

    return (
        <div className="flex flex-1 min-h-0 w-full flex-col">
            <div
                className={cn(
                    "mx-auto flex w-full max-w-screen-2xl flex-1 min-h-0 gap-3",
                    "px-4 py-4 sm:px-6 lg:px-8 lg:py-6",
                    isWide ? "flex-row overflow-hidden max-h-[100svh]" : "flex-col",
                )}
            >
                {!isWide && (
                    <>
                        {inlineHeaderRow}
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
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-md shrink-0 bg-tertiary">
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
                                        <ProgressFooter className="border-t mt-2 pt-3 px-3 pb-1" />
                                    </CardContent>
                                </Card>
                            </Collapsible>
                        </nav>
                    </>
                )}

                {isWide && (
                    <div className="w-72 shrink-0 h-full flex flex-col gap-4 min-h-0">
                        <div className="flex items-center gap-2 shrink-0">
                            <Button variant="tertiary-outline" onClick={handleExit} className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                            {chromeTriggers}
                        </div>
                        <h1 className="flex items-center gap-2 text-xl font-bold min-w-0 shrink-0">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-tertiary shrink-0" aria-hidden="true">
                                <Compass className="h-4 w-4 text-tertiary-foreground" />
                            </span>
                            <span className="truncate">Self Discovery</span>
                        </h1>
                        <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
                            <CardContent className="p-3 flex flex-col gap-3 flex-1 min-h-0">
                                <div className="flex-1 min-h-0 overflow-y-auto">
                                    <NavContent pathname={pathname} onNavigate={handleNavigate} />
                                </div>
                                <ProgressFooter className="shrink-0 border-t pt-3 px-1" />
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="flex-1 min-h-0 min-w-0">
                    {children}
                </div>
            </div>
        </div>
    )
}

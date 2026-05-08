"use client"

import { Card, CardContent } from "@/components/ui/card"
import { getSelfDiscoveryCategoryIcon } from "@/config/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { ArrowLeft, ChevronDown, Compass, type LucideIcon } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { SELF_DISCOVERY_CATEGORIES } from "@/data/selfDiscoveryData"
import { useContainerSize } from "@/context/container-size-context"

const BASE_PATH = "/self-discovery/discover"

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
        pathname.startsWith(`${BASE_PATH}/${c.url}`)
    )?.url
    const isOtherActive = pathname.startsWith(`${BASE_PATH}/${OTHER_CATEGORY.url}`)
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
                variant={pathname === BASE_PATH ? "secondary" : "ghost"}
                className="w-full justify-start h-auto whitespace-normal text-left py-1.5 px-3 gap-2"
                onClick={() => onNavigate(BASE_PATH)}
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
                            className={`w-full h-auto py-1.5 gap-4 justify-between px-3 text-sm text-left whitespace-normal rounded-md hover:no-underline ${pathname === `${BASE_PATH}/${category.url}`
                                ? "bg-secondary text-secondary-foreground"
                                : pathname.startsWith(`${BASE_PATH}/${category.url}/`)
                                    ? "text-foreground hover:bg-accent hover:text-primary"
                                    : "hover:bg-accent hover:text-primary"
                                }`}
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
                                    const isActive = pathname === `${BASE_PATH}/${category.url}/${question.url}`
                                    return (
                                        <li
                                            key={question.url}
                                            className={cn(
                                                "text-sm cursor-pointer rounded-md px-2 py-1",
                                                isActive
                                                    ? "bg-secondary text-secondary-foreground font-medium"
                                                    : "text-muted-foreground hover:text-primary"
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
                ))}
            </Accordion>
            <Button
                variant={isOtherActive ? "secondary" : "ghost"}
                className="w-full justify-start h-auto whitespace-normal text-left py-1.5 px-3 gap-2"
                onClick={() => onNavigate(`${BASE_PATH}/${OTHER_CATEGORY.url}`)}
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
    if (pathname === BASE_PATH) {
        return { label: "Introduction", Icon: Compass, bgClass: "bg-primary" }
    }
    if (pathname.startsWith(`${BASE_PATH}/${OTHER_CATEGORY.url}`)) {
        const OtherIcon = getSelfDiscoveryCategoryIcon(OTHER_CATEGORY.url) ?? Compass
        return {
            label: OTHER_CATEGORY.title,
            Icon: OtherIcon,
            bgClass: CATEGORY_ICON_BG[OTHER_CATEGORY.url] ?? "bg-primary",
        }
    }
    for (const category of SELF_DISCOVERY_CATEGORIES) {
        if (pathname.startsWith(`${BASE_PATH}/${category.url}`)) {
            const CategoryIcon = getSelfDiscoveryCategoryIcon(category.url) ?? Compass
            const bgClass = CATEGORY_ICON_BG[category.url] ?? "bg-primary"
            const matchedQuestion = category.questions.find(q =>
                pathname === `${BASE_PATH}/${category.url}/${q.url}`
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

export default function SelfDiscoveryFlowLayout({
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

    const handleExit = () => {
        router.push("/self-discovery")
    }

    const { label: activeLabel, Icon: ActiveIcon, bgClass: activeBgClass } = getActiveInfo(pathname)

    const inlineHeaderRow = (
        <div className="flex items-center gap-3 shrink-0">
            <Button variant="primary-outline" onClick={handleExit} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>
            <h1 className="flex items-center gap-2 text-xl font-bold min-w-0">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary shrink-0" aria-hidden="true">
                    <Compass className="h-4 w-4 text-primary-foreground" />
                </span>
                <span className="truncate">Self Discovery</span>
            </h1>
        </div>
    )

    return (
        <div className="flex h-svh w-full flex-col">
            <div
                className={cn(
                    "mx-auto flex w-full max-w-screen-2xl flex-1 min-h-0 gap-3",
                    "px-4 py-4 sm:px-6 lg:px-8 lg:py-6",
                    isWide ? "flex-row" : "flex-col",
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
                                            <div className="px-1">
                                                <NavContent pathname={pathname} onNavigate={handleNavigate} />
                                            </div>
                                        </CollapsibleContent>
                                    </CardContent>
                                </Card>
                            </Collapsible>
                        </nav>
                    </>
                )}

                {isWide && (
                    <div className="w-72 shrink-0 h-full flex flex-col gap-3 min-h-0">
                        <Button variant="primary-outline" onClick={handleExit} className="gap-2 self-start shrink-0">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
                            <CardContent className="p-3 flex flex-col gap-3 flex-1 min-h-0">
                                <h1 className="flex items-center gap-2 text-xl font-bold min-w-0 shrink-0 px-1 pt-1 pb-3 border-b">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary shrink-0" aria-hidden="true">
                                        <Compass className="h-4 w-4 text-primary-foreground" />
                                    </span>
                                    <span className="truncate">Self Discovery</span>
                                </h1>
                                <div className="flex-1 min-h-0 overflow-y-auto">
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
        </div>
    )
}

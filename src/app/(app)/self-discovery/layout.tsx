"use client"

import { Card, CardContent } from "@/components/ui/card"
import { navigationItems, getSelfDiscoveryCategoryIcon } from "@/config/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { PanelLeftClose } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { SELF_DISCOVERY_CATEGORIES } from "@/data/selfDiscoveryData"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"

export default function SelfDiscoveryLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const navItem = navigationItems.innovation[0]
    const Icon = navItem?.icon
    const [isOpen, setIsOpen] = useState(false)

    const triggers = useSelector((state: RootState) => state.problemTriggers.triggers)

    return (
        <div className="flex flex-col h-full w-full gap-6 flex-1">
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {navItem && Icon && (
                            <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 shrink-0">
                                <Icon className="h-6 w-6 text-primary" />
                            </div>
                        )}
                        <div className="flex flex-col gap-1">
                            <h1 className="text-xl font-bold">Self Discovery</h1>
                            <p className="text-sm text-muted-foreground">Uncover your strengths, interests, and potential as a founder.</p>
                        </div>
                    </div>
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <PanelLeftClose className="h-4 w-4" />
                                Show all trigger items
                            </Button>
                        </SheetTrigger>
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
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="flex gap-6 flex-1 w-full">
                {/* Left Navigation */}
                <Card className="w-72">
                    <CardContent className="p-3">
                        <div className="flex flex-col gap-1">
                            <Button
                                variant={pathname === "/self-discovery" ? "secondary" : "ghost"}
                                className="w-full justify-start h-auto whitespace-normal text-left py-1.5 gap-2"
                                onClick={() => router.push("/self-discovery")}
                            >
                                Intro
                            </Button>
                            <Accordion type="single" collapsible className="w-full flex flex-col gap-1">
                                {SELF_DISCOVERY_CATEGORIES.map((category) => (
                                    <AccordionItem key={category.url} value={category.url}>
                                        <AccordionTrigger
                                            className={`w-full h-auto py-1.5 gap-4 justify-between px-3 text-sm text-left whitespace-normal rounded-md hover:no-underline ${pathname.startsWith(`/self-discovery/${category.url}`)
                                                ? "bg-secondary text-secondary-foreground"
                                                : "hover:bg-accent hover:text-accent-foreground"
                                                }`}
                                            aria-label={`${category.title} category`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {(() => {
                                                    const CategoryIcon = getSelfDiscoveryCategoryIcon(category.url)
                                                    return CategoryIcon && <CategoryIcon className={cn("h-3.5 w-3.5 shrink-0",
                                                        pathname.startsWith(`/self-discovery/${category.url}`) ?
                                                            "text-primary" :
                                                            "text-muted-foreground"
                                                    )} aria-hidden="true" />
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
                                                                    : "text-muted-foreground hover:text-foreground"
                                                            )}
                                                            onClick={() => router.push(`/self-discovery/${category.url}/${question.url}`)}
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
                        </div>
                    </CardContent>
                </Card>

                {/* Right Content */}
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </div>
    )
}

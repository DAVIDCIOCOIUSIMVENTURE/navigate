"use client"

import { Card, CardContent } from "@/components/ui/card"
import { getNavigationItem, getSelfDiscoveryCategoryIcon } from "@/config/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { PanelLeftClose } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Category {
    id: string
    title: string
    url: string
    questions: Question[]
}

interface Question {
    id: string
    title: string
    description: string
    url: string
    selfDiscoveryQuestionCategoryId: string
}

interface IdeaTrigger {
    id: string
    title: string
    userId: string
    selfDiscoveryQuestionId: string
}

export default function SelfDiscoveryLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const navItem = getNavigationItem("/self-discovery")
    const Icon = navItem?.icon
    const [categories, setCategories] = useState<Category[]>([])
    const [ideaTriggers, setIdeaTriggers] = useState<IdeaTrigger[]>([])
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch categories, questions, and idea triggers
                const [categoriesRes, questionsRes, triggersRes] = await Promise.all([
                    fetch('http://localhost:3001/selfDiscoveryQuestionCategories'),
                    fetch('http://localhost:3001/selfDiscoveryQuestions'),
                    fetch('http://localhost:3001/ideaTriggers')
                ])

                const categoriesData = await categoriesRes.json()
                const questionsData = await questionsRes.json()
                const triggersData = await triggersRes.json()

                // Combine categories with their questions
                const categoriesWithQuestions = categoriesData.map((category: Category) => ({
                    ...category,
                    questions: questionsData.filter((question: Question) =>
                        question.selfDiscoveryQuestionCategoryId === category.id
                    )
                }))

                setCategories(categoriesWithQuestions)
                setIdeaTriggers(triggersData)
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="flex flex-col h-full w-full gap-6 flex-1">
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {navItem && Icon && (
                           <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500">
                           <Icon className="h-5 w-5 text-white" />
                         </div>
                        )}
                        <h1 className="text-lg font-bold">Self Discovery</h1>
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
                                <div className="space-y-4 pr-4">
                                    {categories.map((category) => (
                                        <div key={category.id} className="space-y-2">
                                            <h4 className="font-medium text-sm flex items-center gap-2">
                                                {(() => {
                                                    const Icon = getSelfDiscoveryCategoryIcon(category.id)
                                                    return Icon && <Icon className="h-4 w-4" />
                                                })()}
                                                {category.title}
                                            </h4>
                                            {category.questions.map((question) => (
                                                <div key={question.id} className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">{question.title}</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {ideaTriggers
                                                            .filter(trigger => trigger.selfDiscoveryQuestionId === question.id)
                                                            .map((trigger) => (
                                                                <div
                                                                    key={trigger.id}
                                                                    className="text-xs bg-secondary text-secondary-foreground rounded-md px-3 py-1.5"
                                                                >
                                                                    {trigger.title}
                                                                </div>
                                                            ))}
                                                        {ideaTriggers.filter(trigger => trigger.selfDiscoveryQuestionId === question.id).length === 0 && (
                                                            <p className="text-xs text-muted-foreground col-span-2">No triggers added yet</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                </div>
                <p className="text-muted-foreground text-sm">
                    Explore your interests, skills, and potential through guided questions and exercises.
                </p>
            </div>

            <div className="flex gap-6 flex-1 w-full">
                {/* Left Navigation */}
                <Card className="w-64">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-2">
                            <Button
                                variant={pathname === "/self-discovery" ? "secondary" : "ghost"}
                                className="w-full justify-start h-auto py-2 text-left whitespace-normal"
                                onClick={() => router.push("/self-discovery")}
                            >
                                Intro
                            </Button>
                            <Accordion type="single" collapsible className="w-full flex flex-col gap-2">
                                {categories.map((category) => (
                                    <AccordionItem key={category.id} value={category.id}>
                                        <AccordionTrigger
                                            className={`w-full h-auto py-2 px-3 text-left whitespace-normal rounded-md hover:no-underline ${
                                                pathname.startsWith(`/self-discovery/${category.url}`)
                                                    ? "bg-secondary text-secondary-foreground"
                                                    : "hover:bg-accent hover:text-accent-foreground"
                                            }`}
                                            aria-label={`${category.title} category`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {(() => {
                                                    const Icon = getSelfDiscoveryCategoryIcon(category.id)
                                                    return Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                                })()}
                                                {category.title}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <ul className="pl-6 space-y-2 list-disc mt-2" role="list">
                                                {category.questions.map((question) => (
                                                    <li
                                                        key={question.id}
                                                        className={`text-sm text-muted-foreground hover:text-foreground cursor-pointer ${
                                                            pathname === `/self-discovery/${category.url}/${question.url}` ? "text-primary" : ""
                                                        }`}
                                                        onClick={() => router.push(`/self-discovery/${category.url}/${question.url}`)}
                                                        role="menuitem"
                                                        aria-current={pathname === `/self-discovery/${category.url}/${question.url}` ? "page" : undefined}
                                                    >
                                                        {question.title}
                                                    </li>
                                                ))}
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
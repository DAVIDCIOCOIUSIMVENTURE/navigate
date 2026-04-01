"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2, Compass, ChevronDown, ChevronRight, Plus } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { getSelfDiscoveryCategoryIcon } from "@/config/navigation"
import { SELF_DISCOVERY_CATEGORIES, type SuggestionItem } from "@/data/selfDiscoveryData"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { ProblemTrigger } from "@/store/problem-triggers-model"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

const SDGS = [
    "No poverty",
    "Zero hunger",
    "Good health and well-being",
    "Quality Education",
    "Gender equality",
    "Clean water and sanitation",
    "Affordable and clean energy",
    "Decent work and economic growth",
    "Industry, innovation and infrastructure",
    "Reduced inequalities",
    "Sustainable cities and economies",
    "Responsible consumption and production",
    "Climate action",
    "Life below water",
    "Life on land",
    "Peace, justice and strong institutions",
    "Partnership for the goals"
]

function SuggestionTreeItem({
    item,
    selectedIds,
    onToggle,
}: {
    item: SuggestionItem
    selectedIds: Set<string>
    onToggle: (id: string, label: string) => void
}) {
    const isGroup = !!item.children?.length
    const [open, setOpen] = useState(true)

    if (isGroup) {
        const selectedCount = item.children!.filter((c) => selectedIds.has(c.id)).length
        return (
            <Collapsible open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-1 py-1.5 rounded-md hover:bg-accent/50 transition-colors">
                    {open
                        ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    }
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide select-none flex-1 text-left">
                        {item.label}
                    </span>
                    {selectedCount > 0 && (
                        <span className="text-xs text-primary font-medium tabular-nums">
                            {selectedCount}
                        </span>
                    )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="ml-4 flex flex-col">
                        {item.children!.map((child) => (
                            <SuggestionTreeItem
                                key={child.id}
                                item={child}
                                selectedIds={selectedIds}
                                onToggle={onToggle}
                            />
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        )
    }

    const isSelected = selectedIds.has(item.id)

    return (
        <button
            type="button"
            onClick={() => onToggle(item.id, item.label)}
            className={cn(
                "flex items-center gap-2.5 px-1 py-1.5 cursor-pointer rounded-md hover:bg-accent/50 transition-colors text-left w-full",
                isSelected && "bg-primary/5"
            )}
        >
            <div className={cn(
                "h-4 w-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors",
                isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
            )}>
                {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M8.5 2.5L3.5 7.5L1.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>
            <span className={cn(
                "text-sm select-none",
                isSelected ? "font-medium text-foreground" : "text-muted-foreground"
            )}>
                {item.label}
            </span>
        </button>
    )
}

export default function QuestionPage() {
    const router = useRouter()
    const params = useParams()
    const categoryId = params.categoryId as string
    const questionId = params.questionId as string

    const category = SELF_DISCOVERY_CATEGORIES.find(c => c.url === categoryId) ?? null
    const question = category?.questions.find(q => q.url === questionId) ?? null
    const [answers, setAnswers] = useState<{ [key: string]: string }>({})
    const [problemTriggerToDelete, setProblemTriggerToDelete] = useState<ProblemTrigger | null>(null)
    const [sdgToAdd, setSdgToAdd] = useState<{ questionUrl: string; sdg: string } | null>(null)

    const triggers = useSelector((state: RootState) => state.problemTriggers.triggers)
    const dispatch = useDispatch<AppDispatch>()

    const handleAddAnswer = () => {
        const answer = answers[question?.url || '']
        if (!answer || !question) return

        dispatch.problemTriggers.addTrigger({ title: answer, questionUrl: question.url })
        setAnswers(prev => ({ ...prev, [question.url]: '' }))
    }

    const handleDeleteTrigger = (triggerId: string) => {
        dispatch.problemTriggers.removeTrigger(triggerId)
        setProblemTriggerToDelete(null)
    }

    const handleBack = () => {
        if (!category || !question) return

        const categoryQuestions = category.questions
        const currentIndex = categoryQuestions.findIndex(q => q.url === question.url)

        if (currentIndex > 0) {
            const previousQuestion = categoryQuestions[currentIndex - 1]
            router.push(`/self-discovery/${category.url}/${previousQuestion.url}`)
        } else {
            const currentCategoryIndex = SELF_DISCOVERY_CATEGORIES.findIndex(cat => cat.url === category.url)
            if (currentCategoryIndex > 0) {
                const previousCategory = SELF_DISCOVERY_CATEGORIES[currentCategoryIndex - 1]
                const lastQuestion = previousCategory.questions[previousCategory.questions.length - 1]
                if (lastQuestion) {
                    router.push(`/self-discovery/${previousCategory.url}/${lastQuestion.url}`)
                }
            } else {
                router.push('/self-discovery')
            }
        }
    }

    const handleNext = () => {
        if (!category || !question) return

        const categoryQuestions = category.questions
        const currentIndex = categoryQuestions.findIndex(q => q.url === question.url)

        if (currentIndex < categoryQuestions.length - 1) {
            const nextQuestion = categoryQuestions[currentIndex + 1]
            router.push(`/self-discovery/${category.url}/${nextQuestion.url}`)
        } else {
            const currentCategoryIndex = SELF_DISCOVERY_CATEGORIES.findIndex(cat => cat.url === category.url)
            if (currentCategoryIndex < SELF_DISCOVERY_CATEGORIES.length - 1) {
                const nextCategory = SELF_DISCOVERY_CATEGORIES[currentCategoryIndex + 1]
                if (nextCategory.questions.length > 0) {
                    router.push(`/self-discovery/${nextCategory.url}/${nextCategory.questions[0].url}`)
                }
            } else {
                router.push('/ideas')
            }
        }
    }

    const handleToggleSDG = (sdg: string) => {
        if (!question) return

        const existingTrigger = triggers.find(
            trigger => trigger.questionUrl === question.url && trigger.title === sdg
        )

        if (existingTrigger) {
            dispatch.problemTriggers.removeTrigger(existingTrigger.id)
        } else {
            const existingSDGs = triggers.filter(trigger => trigger.questionUrl === question.url)
            if (existingSDGs.length >= 3) {
                setSdgToAdd({ questionUrl: question.url, sdg })
            } else {
                dispatch.problemTriggers.addTrigger({ title: sdg, questionUrl: question.url })
            }
        }
    }

    const addSDG = (sdg: string) => {
        if (!question) return
        dispatch.problemTriggers.addTrigger({ title: sdg, questionUrl: question.url })
        setSdgToAdd(null)
    }

    const selectedSuggestionIds = new Set(triggers.filter(t => t.questionUrl === question?.url && t.suggestionId).map(t => t.suggestionId!))

    const handleToggleSuggestion = (suggestionId: string, label: string) => {
        if (!question) return
        const existing = triggers.find(t => t.questionUrl === question.url && t.suggestionId === suggestionId)
        if (existing) {
            dispatch.problemTriggers.removeTrigger(existing.id)
        } else {
            dispatch.problemTriggers.addTrigger({ title: label, questionUrl: question.url, suggestionId })
        }
    }

    if (!category || !question) {
        return <Card className="w-full flex-1">
            <CardContent className="flex p-8 w-full flex-1 flex-col gap-4">Loading...</CardContent>
        </Card>
    }

    const questionTriggers = triggers.filter(trigger => trigger.questionUrl === question.url)

    return (
        <>
            <Card className="w-full h-full flex flex-col overflow-hidden">
                <CardHeader className="px-10 pt-10 pb-0 shrink-0">
                    <CardTitle icon={(() => {
                        const CategoryIcon = getSelfDiscoveryCategoryIcon(category.url)
                        return CategoryIcon || Compass
                    })()} className="text-primary">{question.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-10 pt-6 min-h-0 flex flex-col overflow-y-auto">
                    <div className="flex flex-col gap-5 flex-1 min-h-0">
                        <p className="text-md text-foreground shrink-0">
                            {category.description}
                        </p>
                        <div className="flex flex-col gap-4 flex-1 min-h-0">
                            <p className="text-md text-foreground shrink-0">{question.description}</p>
                            {questionTriggers.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {questionTriggers.map((trigger) => (
                                        <div
                                            key={trigger.id}
                                            className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm"
                                        >
                                            <span className="flex-1">{trigger.title}</span>
                                            <Button
                                                variant="destructive-ghost"
                                                size="icon"
                                                onClick={() => setProblemTriggerToDelete(trigger)}
                                                className="h-4 w-4"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {question.titleId === "sustainability-goals" ? (
                                <div className="grid grid-cols-6 gap-2">
                                    {Array.from({ length: 17 }, (_, i) => i + 1).map((num) => {
                                        const sdg = SDGS[num - 1]
                                        const isSelected = questionTriggers.some(trigger => trigger.title === sdg)
                                        return (
                                            <Button
                                                key={num}
                                                variant={isSelected ? "primary-outline" : "outline"}
                                                className="relative aspect-square p-0 overflow-hidden h-auto"
                                                onClick={() => handleToggleSDG(sdg)}
                                            >
                                                <Image
                                                    src={`/sdgs/${num}.jpg`}
                                                    alt={`Sustainable Development Goal ${num}: ${sdg}`}
                                                    fill
                                                    className={`rounded-lg object-cover transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70'}`}
                                                />
                                                <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                                                </div>
                                            </Button>
                                        )
                                    })}
                                </div>
                            ) : question.suggestions ? (
                                <div className="flex flex-col gap-3 flex-1 min-h-0">
                                    <div className="flex gap-2 shrink-0">
                                        <Input
                                            placeholder="Add your own..."
                                            value={answers[question.url] || ''}
                                            onChange={(e) => setAnswers(prev => ({ ...prev, [question.url]: e.target.value }))}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddAnswer()
                                                }
                                            }}
                                            className="text-sm h-9"
                                        />
                                        <Button onClick={handleAddAnswer} size="sm" className="gap-1.5">
                                            <Plus className="h-3.5 w-3.5" />
                                            Add
                                        </Button>
                                    </div>
                                    <ScrollArea className="flex-1 min-h-[200px] rounded-lg border p-3">
                                        <div className="flex flex-col">
                                            {question.suggestions.map((item) => (
                                                <SuggestionTreeItem
                                                    key={item.id}
                                                    item={item}
                                                    selectedIds={selectedSuggestionIds}
                                                    onToggle={handleToggleSuggestion}
                                                />
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Type your answer..."
                                        value={answers[question.url] || ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [question.url]: e.target.value }))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddAnswer()
                                            }
                                        }}
                                        className="text-sm h-9"
                                    />
                                    <Button onClick={handleAddAnswer}>
                                        Add
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="px-10 shrink-0 flex justify-between border-t py-6">
                    <Button variant="outline" onClick={handleBack}>Previous</Button>
                    <Button onClick={handleNext}>Next</Button>
                </CardFooter>
            </Card>

            <Dialog open={!!problemTriggerToDelete} onOpenChange={() => setProblemTriggerToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Idea Trigger</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this idea trigger? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProblemTriggerToDelete(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => problemTriggerToDelete && handleDeleteTrigger(problemTriggerToDelete.id)}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!sdgToAdd} onOpenChange={() => setSdgToAdd(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Another Goal?</DialogTitle>
                        <DialogDescription>
                            We recommend selecting up to 3 sustainability goals to focus your efforts. Are you sure you want to add another goal?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSdgToAdd(null)}>Cancel</Button>
                        <Button
                            onClick={() => sdgToAdd && addSDG(sdgToAdd.sdg)}
                        >
                            Add Goal
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect, useMemo, useDeferredValue, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Trash2,
    Compass,
    ChevronDown,
    ChevronRight,
    Plus,
    Search,
    X,
    Check,
    Pencil,
    ChevronsUpDown,
    ChevronsDownUp,
    Palette,
    Dumbbell,
    TreePine,
    Cpu,
    Utensils,
    GraduationCap,
    Users,
    Plane,
    Heart,
    Briefcase,
    Trophy,
    ShieldAlert,
    User,
    BookOpen,
    Scale,
    Code,
    BarChart3,
    Cog,
    PenLine,
    MessageSquare,
    Crown,
    Brain,
    Target,
    TrendingUp,
    Globe,
    HeartHandshake,
    Folder,
    type LucideIcon,
} from "lucide-react"
import { useRouter, useParams } from "@/lib/router"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { getSelfDiscoveryCategoryIcon } from "@/config/navigation"
import { SELF_DISCOVERY_CATEGORIES, SELF_DISCOVERY_CATEGORY_ICON_BG, type SuggestionItem } from "@/data/selfDiscoveryData"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { SelfDiscoveryItem } from "@/store/self-discovery-items-model"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useContainerSize } from "@/context/container-size-context"

const GROUP_ICON_RULES: ReadonlyArray<readonly [RegExp, LucideIcon]> = [
    [/software|programm|coding/, Code],
    [/data|analytic/, BarChart3],
    [/technical|hardware/, Cog],
    [/tech|science/, Cpu],
    [/writing/, PenLine],
    [/media|communicat/, MessageSquare],
    [/creative|art|design/, Palette],
    [/leadership|management/, Crown],
    [/strategy|analysis/, Target],
    [/thinking|problem/, Brain],
    [/sport|fitness|physical|hands-on|trade|practical/, Dumbbell],
    [/outdoor|nature|environment|climate/, TreePine],
    [/food|drink/, Utensils],
    [/travel/, Plane],
    [/education|learning|intellectual|growth/, GraduationCap],
    [/marketing/, TrendingUp],
    [/wellness|mindful|wellbeing|health/, Heart],
    [/family|relationship/, HeartHandshake],
    [/people|interpersonal/, Users],
    [/business|entrepreneur|career|work|finance|operations|economic|labour|economy/, Briefcase],
    [/adversity|challenge/, ShieldAlert],
    [/achievement|milestone/, Trophy],
    [/personal|identity|self-management/, User],
    [/humanities/, BookOpen],
    [/law|policy|rights|equality|justice|govern|freedom|expression/, Scale],
    [/global|geopolitical/, Globe],
    [/access|services|issue/, HeartHandshake],
    [/social|community/, Users],
]

function getGroupIcon(label: string): LucideIcon {
    const l = label.toLowerCase()
    for (const [re, icon] of GROUP_ICON_RULES) {
        if (re.test(l)) return icon
    }
    return Folder
}

function filterSuggestionItems(items: SuggestionItem[], query: string): SuggestionItem[] {
    if (!query) return items
    const lower = query.toLowerCase()
    return items.flatMap((item) => {
        if (item.children) {
            const filtered = filterSuggestionItems(item.children, query)
            if (filtered.length > 0) return [{ ...item, children: filtered }]
            if (item.label.toLowerCase().includes(lower)) return [item]
            return []
        }
        return item.label.toLowerCase().includes(lower) ? [item] : []
    })
}

function SuggestionTreeItem({
    item,
    selectedIds,
    onToggle,
    defaultOpen = false,
}: {
    item: SuggestionItem
    selectedIds: Set<string>
    onToggle: (id: string, label: string) => void
    defaultOpen?: boolean
}) {
    const isGroup = !!item.children?.length
    const [open, setOpen] = useState(defaultOpen)

    if (isGroup) {
        const selectedCount = item.children!.filter((c) => selectedIds.has(c.id)).length
        const GroupIcon = getGroupIcon(item.label)
        return (
            <Collapsible open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-1 py-1.5 rounded-md hover:bg-accent/50 transition-colors">
                    {open
                        ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    }
                    <GroupIcon className="h-3.5 w-3.5 text-foreground shrink-0" aria-hidden="true" />
                    <span className="text-sm font-semibold text-foreground uppercase tracking-wide select-none flex-1 text-left">
                        {item.label}
                    </span>
                    {selectedCount > 0 && (
                        <span className="text-sm text-secondary-brand font-medium tabular-nums">
                            {selectedCount}
                        </span>
                    )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="ml-7 flex flex-col">
                        {item.children!.map((child) => (
                            <SuggestionTreeItem
                                key={child.id}
                                item={child}
                                selectedIds={selectedIds}
                                onToggle={onToggle}
                                defaultOpen={defaultOpen}
                            />
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        )
    }

    const isSelected = selectedIds.has(item.id)

    return (
        <label className="flex items-center gap-2.5 px-1 py-1.5 cursor-pointer rounded-md hover:bg-accent/50 transition-colors">
            <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggle(item.id, item.label)}
                className="border-secondary-brand data-[state=checked]:bg-secondary-brand data-[state=checked]:text-secondary-brand-foreground"
            />
            <span className={cn(
                "text-sm text-foreground select-none",
                isSelected && "font-medium"
            )}>
                {item.label}
            </span>
        </label>
    )
}

export default function QuestionPage() {
    const router = useRouter()
    const params = useParams()
    const categoryId = params.categoryId as string
    const questionId = params.questionId as string
    const size = useContainerSize()
    const roomy = size !== "narrow"

    const category = SELF_DISCOVERY_CATEGORIES.find(c => c.url === categoryId) ?? null
    const question = category?.questions.find(q => q.url === questionId) ?? null
    const [answers, setAnswers] = useState<{ [key: string]: string }>({})
    const [problemTriggerToDelete, setProblemTriggerToDelete] = useState<SelfDiscoveryItem | null>(null)
    const [editingTriggerId, setEditingTriggerId] = useState<string | null>(null)
    const [editingDraft, setEditingDraft] = useState("")
    const [mounted, setMounted] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const deferredQuery = useDeferredValue(searchQuery)
    const [defaultGroupOpen, setDefaultGroupOpen] = useState(false)
    const [treeResetKey, setTreeResetKey] = useState(0)
    const prevDeferredQuery = useRef("")
    useEffect(() => { setMounted(true) }, [])
    useEffect(() => {
        setSearchQuery("")
        setDefaultGroupOpen(false)
        setTreeResetKey(k => k + 1)
        prevDeferredQuery.current = ""
    }, [questionId])
    useEffect(() => {
        const wasEmpty = !prevDeferredQuery.current
        const isNonEmpty = !!deferredQuery
        if (wasEmpty && isNonEmpty) {
            setDefaultGroupOpen(true)
            setTreeResetKey(k => k + 1)
        }
        prevDeferredQuery.current = deferredQuery
    }, [deferredQuery])

    const filteredSuggestions = useMemo(() => {
        if (!question?.suggestions) return []
        return filterSuggestionItems(question.suggestions, deferredQuery)
    }, [question?.suggestions, deferredQuery])

    const triggers = useSelector((state: RootState) => state.selfDiscoveryItems.items)
    const allProblems = useSelector((state: RootState) => state.problems.problems)
    const dispatch = useDispatch<AppDispatch>()

    const referencingProblemsCount = problemTriggerToDelete
        ? allProblems.filter((p) => p.you?.includes(problemTriggerToDelete.id)).length
        : 0

    const handleAddAnswer = () => {
        const answer = answers[question?.url || '']
        if (!answer || !question) return

        dispatch.selfDiscoveryItems.addItem({ title: answer, questionUrl: question.url })
        setAnswers(prev => ({ ...prev, [question.url]: '' }))
    }

    const handleDeleteTrigger = (triggerId: string) => {
        dispatch.selfDiscoveryItems.removeItem(triggerId)
        setProblemTriggerToDelete(null)
    }

    const beginEditTrigger = (trigger: SelfDiscoveryItem) => {
        setEditingTriggerId(trigger.id)
        setEditingDraft(trigger.title)
    }
    const cancelEditTrigger = () => {
        setEditingTriggerId(null)
        setEditingDraft("")
    }
    const commitEditTrigger = () => {
        if (!editingTriggerId) return
        const trimmed = editingDraft.trim()
        if (!trimmed) return
        dispatch.selfDiscoveryItems.updateItem({ id: editingTriggerId, title: trimmed })
        setEditingTriggerId(null)
        setEditingDraft("")
    }

    const handleBack = () => {
        if (!category || !question) return

        const categoryQuestions = category.questions
        const currentIndex = categoryQuestions.findIndex(q => q.url === question.url)

        if (currentIndex > 0) {
            const previousQuestion = categoryQuestions[currentIndex - 1]
            router.push(`/self-discovery/discover/${category.url}/${previousQuestion.url}`)
        } else {
            router.push(`/self-discovery/discover/${category.url}`)
        }
    }

    const handleNext = () => {
        if (!category || !question) return

        const categoryQuestions = category.questions
        const currentIndex = categoryQuestions.findIndex(q => q.url === question.url)

        if (currentIndex < categoryQuestions.length - 1) {
            const nextQuestion = categoryQuestions[currentIndex + 1]
            router.push(`/self-discovery/discover/${category.url}/${nextQuestion.url}`)
        } else {
            const currentCategoryIndex = SELF_DISCOVERY_CATEGORIES.findIndex(cat => cat.url === category.url)
            if (currentCategoryIndex < SELF_DISCOVERY_CATEGORIES.length - 1) {
                const nextCategory = SELF_DISCOVERY_CATEGORIES[currentCategoryIndex + 1]
                router.push(`/self-discovery/discover/${nextCategory.url}`)
            } else {
                router.push('/self-discovery/discover/other')
            }
        }
    }

    const selectedSuggestionIds = new Set(triggers.filter(t => t.questionUrl === question?.url && t.suggestionId).map(t => t.suggestionId!))

    const handleToggleSuggestion = (suggestionId: string, label: string) => {
        if (!question) return
        const existing = triggers.find(t => t.questionUrl === question.url && t.suggestionId === suggestionId)
        if (existing) {
            dispatch.selfDiscoveryItems.removeItem(existing.id)
        } else {
            dispatch.selfDiscoveryItems.addItem({ title: label, questionUrl: question.url, suggestionId })
        }
    }

    if (!category || !question || !mounted) {
        return <Card className="w-full flex-1">
            <CardContent className="flex p-8 w-full flex-1 flex-col gap-4">Loading...</CardContent>
        </Card>
    }

    const questionTriggers = triggers.filter(trigger => trigger.questionUrl === question.url)

    return (
        <>
            <Card className="w-full h-full flex flex-col overflow-hidden">
                <CardHeader className={cn("pb-0 shrink-0", roomy ? "px-10 pt-10" : "px-6 pt-6")}>
                    <CardTitle icon={(() => {
                        const CategoryIcon = getSelfDiscoveryCategoryIcon(category.url)
                        return CategoryIcon || Compass
                    })()} iconBg={SELF_DISCOVERY_CATEGORY_ICON_BG[category.url] ?? "bg-primary"} className="text-foreground">{question.title}</CardTitle>
                </CardHeader>
                <CardContent className={cn("flex-1 min-h-0 flex flex-col overflow-y-auto", roomy ? "p-10 pt-6" : "p-6 pt-4")}>
                    <div className="flex flex-col gap-5 flex-1 min-h-0">
                        <div className="flex flex-col gap-4 flex-1 min-h-0">
                            <div className="shrink-0">
                                <p className="text-base text-foreground">
                                    {category.description} {question.description}{" "}
                                    {question.suggestions
                                        ? "Select the items that apply to you, or add your own."
                                        : "Type your answer below and click Add."}
                                </p>
                            </div>
                            {question.suggestions ? (
                                <div className={cn("flex gap-4 flex-1 min-h-0", roomy ? "flex-row" : "flex-col")}>
                                    <div className={cn("flex flex-col gap-3", roomy ? "w-72 shrink-0" : "shrink-0")}>
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
                                            <Button onClick={handleAddAnswer} size="sm" variant="secondary-brand" className="gap-1.5">
                                                <Plus className="h-3.5 w-3.5" />
                                                Add
                                            </Button>
                                        </div>
                                        <ScrollArea className={cn("rounded-lg border p-3", roomy ? "flex-1 min-h-0" : "max-h-48 min-h-[100px]")}>
                                            {questionTriggers.length === 0 ? (
                                                <p className="text-sm text-center py-4">Your selections will appear here.</p>
                                            ) : (
                                                <div className="flex flex-col gap-2">
                                                    {questionTriggers.map((trigger) => {
                                                        const isEditing = editingTriggerId === trigger.id
                                                        return (
                                                            <div
                                                                key={trigger.id}
                                                                className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm"
                                                            >
                                                                {isEditing ? (
                                                                    <>
                                                                        <Input
                                                                            value={editingDraft}
                                                                            onChange={(e) => setEditingDraft(e.target.value)}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === "Enter") { e.preventDefault(); commitEditTrigger() }
                                                                                if (e.key === "Escape") { e.preventDefault(); cancelEditTrigger() }
                                                                            }}
                                                                            autoFocus
                                                                            className="h-7 text-sm flex-1"
                                                                        />
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={commitEditTrigger}
                                                                            className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                                                            aria-label="Save"
                                                                        >
                                                                            <Check className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={cancelEditTrigger}
                                                                            className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                                                            aria-label="Cancel"
                                                                        >
                                                                            <X className="h-3 w-3" />
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span className="flex-1">{trigger.title}</span>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => beginEditTrigger(trigger)}
                                                                            className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                                                            aria-label="Rename"
                                                                        >
                                                                            <Pencil className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => setProblemTriggerToDelete(trigger)}
                                                                            className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                                                            aria-label="Delete"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                    <div className="flex flex-col gap-3 flex-1 min-h-0">
                                        <div className={cn("flex gap-2 shrink-0", roomy ? "flex-row items-center" : "flex-col")}>
                                            <div className="relative flex-1">
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search suggestions..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-9 pr-8 h-9"
                                                />
                                                {searchQuery && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSearchQuery("")}
                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                        aria-label="Clear search"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <TooltipProvider delayDuration={200}>
                                                <div className="flex gap-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => {
                                                                    setDefaultGroupOpen(true)
                                                                    setTreeResetKey(k => k + 1)
                                                                }}
                                                                className="shrink-0"
                                                                aria-label="Expand all"
                                                            >
                                                                <ChevronsUpDown className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Expand all</TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => {
                                                                    setDefaultGroupOpen(false)
                                                                    setTreeResetKey(k => k + 1)
                                                                }}
                                                                className="shrink-0"
                                                                aria-label="Collapse all"
                                                            >
                                                                <ChevronsDownUp className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Collapse all</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TooltipProvider>
                                        </div>
                                        <ScrollArea className={cn("rounded-lg border p-3", roomy ? "flex-1 min-h-0" : "flex-1 min-h-[200px]")}>
                                            {filteredSuggestions.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                                                    <Search className="h-5 w-5 text-muted-foreground" />
                                                    <p className="text-sm">No suggestions match your search.</p>
                                                    <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} className="mt-1 gap-1.5">
                                                        <X className="h-3.5 w-3.5" />
                                                        Clear search
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div key={treeResetKey} className="flex flex-col">
                                                    {filteredSuggestions.map((item) => (
                                                        <SuggestionTreeItem
                                                            key={item.id}
                                                            item={item}
                                                            selectedIds={selectedSuggestionIds}
                                                            onToggle={handleToggleSuggestion}
                                                            defaultOpen={defaultGroupOpen}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {questionTriggers.length > 0 && (
                                        <div className="flex flex-wrap gap-2 shrink-0">
                                            {questionTriggers.map((trigger) => {
                                                const isEditing = editingTriggerId === trigger.id
                                                return (
                                                    <div
                                                        key={trigger.id}
                                                        className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm"
                                                    >
                                                        {isEditing ? (
                                                            <>
                                                                <Input
                                                                    value={editingDraft}
                                                                    onChange={(e) => setEditingDraft(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === "Enter") { e.preventDefault(); commitEditTrigger() }
                                                                        if (e.key === "Escape") { e.preventDefault(); cancelEditTrigger() }
                                                                    }}
                                                                    autoFocus
                                                                    className="h-7 text-sm flex-1"
                                                                />
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={commitEditTrigger}
                                                                    className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                                                    aria-label="Save"
                                                                >
                                                                    <Check className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={cancelEditTrigger}
                                                                    className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                                                    aria-label="Cancel"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="flex-1">{trigger.title}</span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => beginEditTrigger(trigger)}
                                                                    className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                                                    aria-label="Rename"
                                                                >
                                                                    <Pencil className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => setProblemTriggerToDelete(trigger)}
                                                                    className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                                                    aria-label="Delete"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
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
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className={cn("shrink-0 flex justify-between", roomy ? "px-10 pb-6 pt-0" : "px-6 pb-4 pt-0")}>
                    <Button variant="primary-outline" onClick={handleBack}>Previous</Button>
                    <Button onClick={handleNext}>Next</Button>
                </CardFooter>
            </Card>

            <Dialog open={!!problemTriggerToDelete} onOpenChange={() => setProblemTriggerToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete this self-discovery item?</DialogTitle>
                        <DialogDescription>
                            {referencingProblemsCount > 0
                                ? `This item is referenced by ${referencingProblemsCount} saved problem${referencingProblemsCount === 1 ? "" : "s"}. Those problems will keep the reference and show "(deleted item)" in its place. This action cannot be undone.`
                                : "Are you sure you want to delete this item? This action cannot be undone."}
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

        </>
    )
}

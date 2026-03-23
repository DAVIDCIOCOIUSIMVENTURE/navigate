"use client"

import { Card, CardContent, CardHeader, CardEyebrow, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2, Compass } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { getSelfDiscoveryCategoryIcon } from "@/config/navigation"
import { SELF_DISCOVERY_CATEGORIES } from "@/data/selfDiscoveryData"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { ProblemTrigger } from "@/store/problem-triggers-model"

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

    if (!category || !question) {
        return <Card className="w-full flex-1">
            <CardContent className="flex p-8 w-full flex-1 flex-col gap-4">Loading...</CardContent>
        </Card>
    }

    const questionTriggers = triggers.filter(trigger => trigger.questionUrl === question.url)

    return (
        <>
            <Card className="w-full flex-1 h-full flex flex-col">
                <CardHeader className="px-10 pt-10 pb-0">
                    <CardEyebrow icon={Compass}>{category.title}</CardEyebrow>
                    <CardTitle icon={(() => {
                        const CategoryIcon = getSelfDiscoveryCategoryIcon(category.url)
                        return CategoryIcon || Compass
                    })()} className="text-primary">{question.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-10 pt-6 overflow-y-auto">
                    <div className="flex flex-col gap-5">
                        <p className="text-md text-muted-foreground">
                            {category.description}
                        </p>
                        <div className="flex flex-col gap-4">
                            <p className="text-md text-muted-foreground">{question.description}</p>
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
                        </div>
                    </div>
                    <div className="flex justify-between mt-2">
                        <Button variant="outline" onClick={handleBack}>Previous</Button>
                        <Button onClick={handleNext}>Next</Button>
                    </div>
                </CardContent>
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

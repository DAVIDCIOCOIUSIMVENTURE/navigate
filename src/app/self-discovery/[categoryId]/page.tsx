"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronRight, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { getSelfDiscoveryCategoryIcon } from "@/config/navigation"

interface Category {
    id: string
    title: string
    url: string
    questions: Question[]
}

interface Question {
    id: string
    title: string
    titleId: string
    description: string
    selfDiscoveryQuestionCategoryId: string
}

interface IdeaTrigger {
    id: string
    title: string
    userId: string
    selfDiscoveryQuestionId: string
}

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

export default function CategoryPage({
    params,
}: {
    params: { categoryId: string }
}) {
    const router = useRouter()
    const [category, setCategory] = useState<Category | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [answers, setAnswers] = useState<{ [key: string]: string }>({})
    const [isSubmitting, setIsSubmitting] = useState<{ [key: string]: boolean }>({})
    const [ideaTriggers, setIdeaTriggers] = useState<IdeaTrigger[]>([])
    const [triggerToDelete, setTriggerToDelete] = useState<IdeaTrigger | null>(null)
    const [sdgToAdd, setSdgToAdd] = useState<{ questionId: string; sdg: string } | null>(null)

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

                // Find the selected category and its questions using the URL
                const selectedCategory = categoriesData.find((cat: Category) => cat.url === params.categoryId)
                if (selectedCategory) {
                    const categoryQuestions = questionsData.filter((question: Question) =>
                        question.selfDiscoveryQuestionCategoryId === selectedCategory.id
                    )
                    setCategory({
                        ...selectedCategory,
                        questions: categoryQuestions
                    })
                }

                // Store all categories for navigation
                setCategories(categoriesData)
                setIdeaTriggers(triggersData)
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
        fetchData()
    }, [params.categoryId])

    const handleAddAnswer = async (questionId: string) => {
        const answer = answers[questionId]
        if (!answer) return

        setIsSubmitting(prev => ({ ...prev, [questionId]: true }))

        try {
            const response = await fetch('http://localhost:3001/ideaTriggers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: answer,
                    userId: "1", // TODO: Replace with actual user ID
                    selfDiscoveryQuestionId: questionId
                })
            })

            if (!response.ok) {
                throw new Error('Failed to add idea trigger')
            }

            const newTrigger = await response.json()
            setIdeaTriggers(prev => [...prev, newTrigger])

            // Clear the input after successful addition
            setAnswers(prev => ({ ...prev, [questionId]: '' }))
        } catch (error) {
            console.error('Error adding idea trigger:', error)
            // TODO: Add error handling UI
        } finally {
            setIsSubmitting(prev => ({ ...prev, [questionId]: false }))
        }
    }

    const handleDeleteTrigger = async (triggerId: string) => {
        try {
            const response = await fetch(`http://localhost:3001/ideaTriggers/${triggerId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('Failed to delete idea trigger')
            }

            // Remove the trigger from the local state
            setIdeaTriggers(prev => prev.filter(trigger => trigger.id !== triggerId))
            setTriggerToDelete(null)
        } catch (error) {
            console.error('Error deleting idea trigger:', error)
            // TODO: Add error handling UI
        }
    }

    const handleNext = () => {
        const currentIndex = categories.findIndex(cat => cat.url === params.categoryId)
        if (currentIndex < categories.length - 1) {
            const nextCategory = categories[currentIndex + 1]
            router.push(`/self-discovery/${nextCategory.url}`)
        } else {
            // If we're on the last category, go to the idea triggers page
            router.push('/idea-triggers')
        }
    }

    const handleToggleSDG = async (questionId: string, sdg: string) => {
        const existingTrigger = ideaTriggers.find(
            trigger => 
                trigger.selfDiscoveryQuestionId === questionId && 
                trigger.title === sdg
        )

        if (existingTrigger) {
            // If the SDG is already selected, remove it
            await handleDeleteTrigger(existingTrigger.id)
        } else {
            // Count existing SDGs for this question
            const existingSDGs = ideaTriggers.filter(
                trigger => trigger.selfDiscoveryQuestionId === questionId
            )

            if (existingSDGs.length >= 3) {
                // Show confirmation dialog only when adding the 4th goal or more
                setSdgToAdd({ questionId, sdg })
            } else {
                // Add the SDG directly for the first 3 goals
                await addSDG(questionId, sdg)
            }
        }
    }

    const addSDG = async (questionId: string, sdg: string) => {
        setIsSubmitting(prev => ({ ...prev, [questionId]: true }))

        try {
            const response = await fetch('http://localhost:3001/ideaTriggers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: sdg,
                    userId: "1", // TODO: Replace with actual user ID
                    selfDiscoveryQuestionId: questionId
                })
            })

            if (!response.ok) {
                throw new Error('Failed to add idea trigger')
            }

            const newTrigger = await response.json()
            setIdeaTriggers(prev => [...prev, newTrigger])
        } catch (error) {
            console.error('Error adding idea trigger:', error)
            // TODO: Add error handling UI
        } finally {
            setIsSubmitting(prev => ({ ...prev, [questionId]: false }))
            setSdgToAdd(null)
        }
    }

    if (!category) {
        return <Card className="w-full flex-1">
            <CardContent className="flex p-6 w-full flex-1 flex-col gap-4">Loading...</CardContent>
        </Card>
    }

    return (
        <>
            <Card className="w-full flex-1">
                <CardContent className="flex p-6 w-full flex-1 flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            {(() => {
                                const Icon = getSelfDiscoveryCategoryIcon(category.id)
                                return Icon && <Icon className="flex items-center justify-center w-5 h-5 rounded-md" />
                            })()}
                            <h2 className="text-lg font-semibold">{category.title}</h2>
                        </div>
                        <p className="text-muted-foreground">
                            Explore questions and exercises related to {category.title.toLowerCase()}.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <h3 className="font-medium">Questions:</h3>
                        <div className="space-y-8">
                            {category.questions.map((question) => (
                                <div key={question.id}>
                                    <div className="font-medium text-foreground">{question.title}</div>
                                    <p className="text-sm mt-1 text-muted-foreground">{question.description}</p>
                                    {question.titleId === "sustainability-goals" ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
                                            {SDGS.map((sdg) => {
                                                const isSelected = ideaTriggers.some(
                                                    trigger => 
                                                        trigger.selfDiscoveryQuestionId === question.id && 
                                                        trigger.title === sdg
                                                )
                                                return (
                                                    <Button
                                                        key={sdg}
                                                        variant={isSelected ? "primary-outline" : "outline"}
                                                        className="justify-start"
                                                        onClick={() => handleToggleSDG(question.id, sdg)}
                                                        disabled={isSubmitting[question.id]}
                                                    >
                                                        {sdg}
                                                    </Button>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 mt-2">
                                            <Input
                                                placeholder="Type your answer..."
                                                value={answers[question.id] || ''}
                                                onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleAddAnswer(question.id)
                                                    }
                                                }}
                                                disabled={isSubmitting[question.id]}
                                            />
                                            <Button
                                                onClick={() => handleAddAnswer(question.id)}
                                                disabled={isSubmitting[question.id]}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {ideaTriggers
                                            .filter(trigger => trigger.selfDiscoveryQuestionId === question.id)
                                            .map((trigger) => (
                                                <div
                                                    key={trigger.id}
                                                    className="flex items-center gap-2 py-1 bg-secondary text-secondary-foreground rounded-md font-medium h-8 rounded-md px-3 text-xs"
                                                >
                                                    <span className="text-xs">{trigger.title}</span>
                                                    <Button
                                                        variant="destructive-ghost"
                                                        size="icon"
                                                        onClick={() => setTriggerToDelete(trigger)}
                                                        className="h-4 w-4"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button 
                        onClick={handleNext}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>

            <Dialog open={!!triggerToDelete} onOpenChange={() => setTriggerToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Idea Trigger</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this idea trigger? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTriggerToDelete(null)}>Cancel</Button>
                        <Button 
                            variant="destructive" 
                            onClick={() => triggerToDelete && handleDeleteTrigger(triggerToDelete.id)}
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
                            onClick={() => sdgToAdd && addSDG(sdgToAdd.questionId, sdgToAdd.sdg)}
                        >
                            Add Goal
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
} 
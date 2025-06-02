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

export default function CategoryRedirectPage({
    params,
}: {
    params: { categoryId: string }
}) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch categories and questions
                const [categoriesRes, questionsRes] = await Promise.all([
                    fetch('http://localhost:3001/selfDiscoveryQuestionCategories'),
                    fetch('http://localhost:3001/selfDiscoveryQuestions')
                ])

                const categoriesData = await categoriesRes.json()
                const questionsData = await questionsRes.json()

                // Find the selected category
                const selectedCategory = categoriesData.find((cat: Category) => cat.url === params.categoryId)
                
                if (selectedCategory) {
                    // Find the first question in this category
                    const firstQuestion = questionsData.find((q: Question) => 
                        q.selfDiscoveryQuestionCategoryId === selectedCategory.id
                    )

                    if (firstQuestion) {
                        // Redirect to the first question
                        router.push(`/self-discovery/${selectedCategory.url}/${firstQuestion.url}`)
                    } else {
                        // If no questions found, redirect to self-discovery home
                        router.push('/self-discovery')
                    }
                } else {
                    // If category not found, redirect to self-discovery home
                    router.push('/self-discovery')
                }
            } catch (error) {
                console.error('Error fetching data:', error)
                router.push('/self-discovery')
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [params.categoryId, router])

    // Show loading state while redirecting
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading...</div>
        </div>
    )
} 
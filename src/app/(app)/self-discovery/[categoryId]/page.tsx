"use client"

import { use } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { SELF_DISCOVERY_CATEGORIES } from "@/data/selfDiscoveryData"
import { getSelfDiscoveryCategoryIcon } from "@/config/navigation"
import { Compass } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

const QUESTION_COLORS = [
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-sky-500",
    "bg-fuchsia-500",
]

export default function CategoryPage({
    params,
}: {
    params: Promise<{ categoryId: string }>
}) {
    const { categoryId } = use(params)
    const router = useRouter()
    const size = useContainerSize()
    const roomy = size !== "narrow"

    const category = SELF_DISCOVERY_CATEGORIES.find(c => c.url === categoryId)
    const categoryIndex = SELF_DISCOVERY_CATEGORIES.findIndex(c => c.url === categoryId)

    if (!category) {
        return (
            <Card className="w-full h-full flex flex-col overflow-hidden">
                <CardContent className="p-8">Category not found.</CardContent>
            </Card>
        )
    }

    const CategoryIcon = getSelfDiscoveryCategoryIcon(category.url) ?? Compass
    const firstQuestion = category.questions[0]

    const handleBack = () => {
        if (categoryIndex > 0) {
            const previousCategory = SELF_DISCOVERY_CATEGORIES[categoryIndex - 1]
            const lastQuestion = previousCategory.questions[previousCategory.questions.length - 1]
            if (lastQuestion) {
                router.push(`/self-discovery/${previousCategory.url}/${lastQuestion.url}`)
                return
            }
            router.push(`/self-discovery/${previousCategory.url}`)
            return
        }
        router.push("/self-discovery")
    }

    const handleNext = () => {
        if (firstQuestion) {
            router.push(`/self-discovery/${category.url}/${firstQuestion.url}`)
        }
    }

    return (
        <Card className="w-full h-full flex flex-col overflow-hidden">
            <CardHeader className={cn("pb-0 shrink-0", roomy ? "px-10 pt-10" : "px-6 pt-6")}>
                <CardTitle icon={CategoryIcon}>{category.title}</CardTitle>
            </CardHeader>
            <CardContent className={cn("flex-1 flex flex-col gap-6 overflow-y-auto min-h-0", roomy ? "p-10 pt-6" : "p-6 pt-4")}>
                <p className="text-md text-foreground leading-relaxed">
                    {category.description}
                </p>

                <div className="flex flex-col gap-4">
                    <h3 className="text-xl font-bold text-foreground">Questions in this section</h3>
                    <ol className="flex flex-col gap-2">
                        {category.questions.map((question, index) => (
                            <li key={question.url}>
                                <button
                                    type="button"
                                    onClick={() => router.push(`/self-discovery/${category.url}/${question.url}`)}
                                    className="flex items-start gap-3 w-full text-left p-3 rounded-md border hover:bg-accent hover:text-primary transition-colors"
                                >
                                    <span className={cn(
                                        "flex items-center justify-center w-7 h-7 rounded-full text-white text-sm font-bold shrink-0",
                                        QUESTION_COLORS[index % QUESTION_COLORS.length],
                                    )}>
                                        {index + 1}
                                    </span>
                                    <span className="flex flex-col gap-0.5">
                                        <span className="font-semibold text-foreground">{question.title}</span>
                                        <span className="text-sm text-muted-foreground">{question.description}</span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ol>
                </div>
            </CardContent>
            <CardFooter className={cn("shrink-0 flex justify-between border-t", roomy ? "px-10 py-6" : "px-6 py-4")}>
                <Button variant="outline" onClick={handleBack}>Previous</Button>
                <Button onClick={handleNext} disabled={!firstQuestion}>Next</Button>
            </CardFooter>
        </Card>
    )
}

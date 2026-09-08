"use client"

import { use } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { SELF_DISCOVERY_CATEGORIES } from "@/data/selfDiscoveryData"
import { getSelfDiscoveryCategoryIcon } from "@/config/navigation"
import { ChevronRight, Compass, Sparkles } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

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
                router.push(`/self-discovery/discover/${previousCategory.url}/${lastQuestion.url}`)
                return
            }
            router.push(`/self-discovery/discover/${previousCategory.url}`)
            return
        }
        router.push("/self-discovery/discover")
    }

    const handleNext = () => {
        if (firstQuestion) {
            router.push(`/self-discovery/discover/${category.url}/${firstQuestion.url}`)
        }
    }

    return (
        <Card className="w-full h-full flex flex-col overflow-hidden">
            <CardHeader className={cn("pb-0 shrink-0", roomy ? "px-10 pt-10" : "px-6 pt-6")}>
                <CardTitle icon={CategoryIcon}>{category.title}</CardTitle>
            </CardHeader>
            <CardContent className={cn("flex-1 flex flex-col gap-6 overflow-y-auto min-h-0", roomy ? "p-10 pt-6" : "p-6 pt-4")}>
                <p className="text-base text-foreground leading-relaxed">
                    {category.description}
                </p>

                <div className="flex flex-col gap-3">
                    <h3 className="text-xl font-bold text-foreground">Questions in this section</h3>
                    <div className={cn("grid grid-cols-1 gap-3", category.questions.length > 1 && "md:grid-cols-2")}>
                        {category.questions.map((question, index) => (
                            <button
                                key={question.url}
                                type="button"
                                onClick={() => router.push(`/self-discovery/discover/${category.url}/${question.url}`)}
                                className="text-left flex items-start gap-3 p-4 rounded-lg border hover:border-primary hover:bg-accent/40 transition-colors"
                            >
                                <span className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-tertiary">
                                    <span className="text-tertiary-foreground text-base font-bold">{index + 1}</span>
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-foreground">{question.title}</p>
                                    <p className="text-base italic mt-0.5 flex items-start gap-1.5">
                                        <Sparkles className="h-3 w-3 shrink-0 mt-1.5" aria-hidden="true" />
                                        <span>{question.description}</span>
                                    </p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" aria-hidden="true" />
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter className={cn("shrink-0 flex justify-between", roomy ? "px-10 pb-6 pt-0" : "px-6 pb-4 pt-0")}>
                <Button variant="primary-outline" onClick={handleBack}>Previous</Button>
                <Button onClick={handleNext} disabled={!firstQuestion}>Next</Button>
            </CardFooter>
        </Card>
    )
}

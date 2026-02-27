"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SELF_DISCOVERY_CATEGORIES } from "@/data/selfDiscoveryData"

export default function CategoryRedirectPage({
    params,
}: {
    params: Promise<{ categoryId: string }>
}) {
    const { categoryId } = use(params)
    const router = useRouter()

    useEffect(() => {
        const category = SELF_DISCOVERY_CATEGORIES.find(c => c.url === categoryId)
        if (category && category.questions.length > 0) {
            router.push(`/self-discovery/${category.url}/${category.questions[0].url}`)
        } else {
            router.push('/self-discovery')
        }
    }, [categoryId, router])

    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading...</div>
        </div>
    )
}

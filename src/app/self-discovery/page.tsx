"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Category {
  id: string
  title: string
  url: string
}

export default function SelfDiscoveryPage() {
  const router = useRouter()
  const [firstCategoryUrl, setFirstCategoryUrl] = useState<string>("")

  useEffect(() => {
    async function fetchCategories() {
      try {
        // const response = await fetch('http://localhost:3001/selfDiscoveryQuestionCategories')
        const response = await fetch('/api/selfDiscoveryQuestionCategories')
        const categories: Category[] = await response.json()
        if (categories.length > 0) {
          setFirstCategoryUrl(categories[0].url)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  return (
    <Card className="w-full flex-1">
      <CardContent className="flex p-6 w-full flex-1 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Welcome to Self Discovery</h2>
          <p className="text-muted-foreground">
            This guided journey will help you uncover your unique strengths, interests, and potential as a founder.
            Through a series of questions and exercises, you&apos;ll gain valuable insights about yourself and your entrepreneurial path.
            At the end of this exercise, you&apos;ll have a set of idea triggers that you can use in the Idea Triggers section to identify potential problems and opportunities.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">What to Expect:</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Answer the questions within each category</li>
            <li>Optionally use suggestion exercises to discover more insights</li>
            <li>Take your time to reflect deeply on each question</li>
            <li>Be honest and specific in your responses</li>
            <li>Return to update your answers as you grow and learn</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => router.push(`/self-discovery/${firstCategoryUrl}`)}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
} 
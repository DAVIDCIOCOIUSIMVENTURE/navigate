"use client"

import { useParams, useRouter } from "@/lib/router"
import { useSelector, useDispatch } from "react-redux"
import Link from "@/components/link"
import type { RootState, AppDispatch } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { PortfolioEditor } from "@/components/portfolio/portfolio-editor"

export default function EditPortfolioPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const portfolioId = Number(params.portfolioId as string)

  const portfolio = useSelector((state: RootState) =>
    state.portfolios.portfolios.find((p) => p.id === portfolioId),
  )

  if (!portfolio) {
    return (
      <div className="flex w-full flex-1 flex-col">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <p className="text-base">Portfolio not found.</p>
            <Button asChild variant="outline">
              <Link href="/portfolio">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <PortfolioEditor
      heading="Edit portfolio"
      cancelHref={`/portfolio/${portfolio.id}`}
      initial={{
        title: portfolio.title,
        description: portfolio.description,
        problemId: portfolio.problemId,
      }}
      onSave={(draft) => {
        dispatch.portfolios.update({ id: portfolio.id, patch: draft })
        router.push(`/portfolio/${portfolio.id}`)
      }}
    />
  )
}

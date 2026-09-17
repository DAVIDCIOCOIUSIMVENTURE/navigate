"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { PortfolioEditor } from "@/components/portfolio/portfolio-editor"

/**
 * Creates a portfolio. A `solution` query param pre-assigns that solution and
 * seeds the title and description from it, which is how the "Build a portfolio
 * for it" next step on a validated solution arrives here; `from` is where
 * Cancel returns to, so the user lands back where they started.
 */
function NewPortfolioForm() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const searchParams = useSearchParams()
  const solutions = useSelector((state: RootState) => state.solutions.solutions)

  // The store hydrates in the layout's mount effect, which runs after this
  // page's. Waiting a render means the editor mounts with the seeded values
  // rather than capturing an empty solution list in its initial state.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const requestedId = Number(searchParams.get("solution"))
  const solution = Number.isInteger(requestedId)
    ? solutions.find((s) => s.id === requestedId)
    : undefined

  const from = searchParams.get("from")
  const cancelHref = from?.startsWith("/") ? from : "/portfolios"

  if (!mounted) return null

  return (
    <PortfolioEditor
      heading="New portfolio"
      cancelHref={cancelHref}
      initial={{
        title: solution?.title ?? "",
        description: solution?.description ?? "",
        solutionId: solution?.id ?? null,
      }}
      onSave={(draft) => {
        const created = dispatch.portfolios.create(draft)
        router.push(`/portfolios/${created.id}`)
      }}
    />
  )
}

export default function NewPortfolioPage() {
  return (
    <Suspense fallback={null}>
      <NewPortfolioForm />
    </Suspense>
  )
}

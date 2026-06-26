"use client"

import { useRouter } from "@/lib/router"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { PortfolioEditor } from "@/components/portfolio/portfolio-editor"

export default function NewPortfolioPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  return (
    <PortfolioEditor
      heading="New portfolio"
      cancelHref="/portfolio"
      initial={{ title: "", description: "", problemId: null }}
      onSave={(draft) => {
        const created = dispatch.portfolios.create(draft)
        router.push(`/portfolio/${created.id}`)
      }}
    />
  )
}

"use client"

import { useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AppDispatch } from "@/store"
import {
  BundleParseError,
  importProblemBundle,
  parseProblemBundle,
} from "@/lib/problem-export"

// A self-contained "Import" button + hidden file input. After import it routes
// to the problem's edit page so the user can confirm the result. Used on both
// the problems list and the solutions list.
export function ImportBundleButton() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setImporting(true)
    try {
      const text = await file.text()
      const bundle = parseProblemBundle(text)
      const result = await importProblemBundle(bundle, dispatch)
      const noun = result.solutionCount === 1 ? "solution" : "solutions"
      if (result.placeholderCreated) {
        toast.success(`Imported ${result.solutionCount} ${noun} into a placeholder problem.`)
      } else if (result.solutionCount > 0) {
        toast.success(`Imported problem with ${result.solutionCount} ${noun}.`)
      } else {
        toast.success("Problem imported.")
      }
      router.push(`/problems/${result.problemId}/edit`)
    } catch (err) {
      const message =
        err instanceof BundleParseError ? err.message :
        err instanceof Error ? err.message :
        "Failed to import bundle."
      toast.error(message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onFileSelected}
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={importing}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        {importing ? "Importing..." : "Import"}
      </Button>
    </>
  )
}

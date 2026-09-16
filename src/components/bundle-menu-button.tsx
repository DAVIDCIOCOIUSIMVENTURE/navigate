"use client"

import { useRef, useState } from "react"
import { useDispatch, useStore } from "react-redux"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MoreHorizontal, Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AppDispatch, RootState } from "@/store"
import {
  BundleParseError,
  importProblemBundle,
  parseProblemBundle,
} from "@/lib/problem-export"
import { projectHrefForProblem } from "@/lib/projects"
import { ExportPickerDialog } from "@/components/export-picker-dialog"

/** What the menu calls a bundle of the given kind. A problem bundle is a whole project (its problem plus solutions). */
const NOUN: Record<"problem" | "solution", string> = {
  problem: "project",
  solution: "solution",
}

// Page-level actions menu for the home page. The 3-dot trigger holds
// "Import <kind>" (file picker) and "Export <kind>" (opens a dialog with a
// record picker plus the include-related checkbox). An imported problem
// arrives with a project of its own, which the page then opens.
export function BundleMenuButton({ kind }: { kind: "problem" | "solution" }) {
  const dispatch = useDispatch<AppDispatch>()
  const store = useStore<RootState>()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const noun = NOUN[kind]

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setImporting(true)
    try {
      const text = await file.text()
      const bundle = parseProblemBundle(text)
      const result = await importProblemBundle(bundle, dispatch)
      const solutionNoun = result.solutionCount === 1 ? "solution" : "solutions"
      if (result.placeholderCreated) {
        toast.success(`Imported ${result.solutionCount} ${solutionNoun} into a placeholder problem.`)
      } else if (result.solutionCount > 0) {
        toast.success(`Imported the project with ${result.solutionCount} ${solutionNoun}.`)
      } else {
        toast.success("Project imported.")
      }
      router.push(projectHrefForProblem(store.getState().projects.projects, result.problemId))
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
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="More actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            <Upload className="h-4 w-4" />
            {importing ? "Importing..." : `Import ${noun}`}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4" />
            Export {noun}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ExportPickerDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        kind={kind}
      />
    </>
  )
}

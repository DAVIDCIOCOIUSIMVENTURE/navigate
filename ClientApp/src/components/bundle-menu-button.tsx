"use client"

import { useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { useRouter } from "@/lib/router"
import { toast } from "sonner"
import { MoreHorizontal, Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AppDispatch } from "@/store"
import {
  BundleParseError,
  importProblemBundle,
  parseProblemBundle,
} from "@/lib/problem-export"
import { ExportPickerDialog } from "@/components/export-picker-dialog"

// Page-level actions menu for the problem and solution lists. The 3-dot
// trigger holds "Import <kind>" (file picker) and "Export <kind>" (opens a
// dialog with a record picker plus the include-related checkbox).
export function BundleMenuButton({ kind }: { kind: "problem" | "solution" }) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

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
            {importing ? "Importing..." : `Import ${kind}`}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4" />
            Export {kind}
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

"use client"

import { useRef, useState } from "react"
import { useDispatch } from "react-redux"
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
  importSummary,
  parseProblemBundle,
} from "@/lib/problem-export"
import { ExportPickerDialog } from "@/components/export-picker-dialog"

/**
 * Page-level actions menu for the home page. The 3-dot trigger holds
 * "Import <kind>" (a file picker) and "Export <kind>" (a dialog with a record
 * picker). Importing always creates a new project, which appears in the list
 * below; the page stays where it is rather than opening it.
 */
export function BundleMenuButton({ kind }: { kind: "project" | "solution" }) {
  const dispatch = useDispatch<AppDispatch>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const noun = kind

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setImporting(true)
    try {
      const text = await file.text()
      const bundle = parseProblemBundle(text)
      const result = await importProblemBundle(bundle, dispatch)
      toast.success(importSummary(result))
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

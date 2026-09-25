"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import { markdownEditorExtensions } from "@/components/ui/markdown-editor"
import { cn } from "@/lib/utils"

/**
 * Markdown written in `MarkdownEditor`, shown read only with the same shape
 * (headings, bullet points, links) and the same `.markdown-editor` styles from
 * `globals.css`, so a note reads the same wherever it is displayed. Later
 * changes to `markdown` are not pushed in: key the component to reset it.
 */
export function MarkdownView({ markdown, className }: { markdown: string; className?: string }) {
  const editor = useEditor({
    extensions: markdownEditorExtensions(),
    content: markdown,
    contentType: "markdown",
    editable: false,
    // The app is server-rendered: the view mounts after hydration to avoid a mismatch.
    immediatelyRender: false,
    editorProps: { attributes: { class: "text-base outline-none" } },
  })

  return (
    <div className={cn("markdown-editor", className)}>
      <EditorContent editor={editor} />
    </div>
  )
}

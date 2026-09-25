"use client"

import { useState } from "react"
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Markdown } from "@tiptap/markdown"
import { Placeholder } from "@tiptap/extensions/placeholder"
import { Bold, ExternalLink, Heading1, Heading2, Italic, Link2, List } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toggle } from "@/components/ui/toggle"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * A small rich-text editor whose value is Markdown. It offers bold, italic,
 * two heading levels, bullet points and links from a toolbar and the usual
 * shortcuts (Ctrl/Cmd+B, Ctrl/Cmd+I), and hands back Markdown on every
 * change, so what it edits can be stored, exported and searched as plain
 * text. Built on Tiptap with its Markdown extension; the content styles live
 * under `.markdown-editor` in `globals.css`.
 */
export type MarkdownEditorProps = {
  /** The Markdown to start from. Later changes to it are not pushed into the editor: key the component to reset it. */
  value: string
  onChange: (markdown: string) => void
  placeholder?: string
  /** The accessible name of the editing area. */
  "aria-label"?: string
  className?: string
}

/** A URL the link dialog accepts: anything with a scheme, or a bare domain given https. */
export function normaliseLinkUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return null
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(withScheme)
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

function ToolbarToggle({
  label,
  pressed,
  onPressedChange,
  children,
}: {
  label: string
  pressed: boolean
  onPressedChange: () => void
  children: React.ReactNode
}) {
  return (
    <Toggle
      size="sm"
      aria-label={label}
      title={label}
      pressed={pressed}
      onPressedChange={onPressedChange}
      // Keep the editor's selection: the toggle must not take focus on click.
      onMouseDown={(e) => e.preventDefault()}
    >
      {children}
    </Toggle>
  )
}

function LinkDialog({
  editor,
  open,
  onOpenChange,
}: {
  editor: Editor
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const current = (editor.getAttributes("link").href as string | undefined) ?? ""
  const [url, setUrl] = useState(current)
  const [invalid, setInvalid] = useState(false)
  const normalised = normaliseLinkUrl(url)

  const apply = () => {
    if (url.trim().length === 0) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      onOpenChange(false)
      return
    }
    if (normalised === null) {
      setInvalid(true)
      return
    }
    const chain = editor.chain().focus().extendMarkRange("link")
    if (editor.state.selection.empty && current.length === 0) {
      // Nothing is selected: write the address itself as the link text.
      chain.insertContent({ type: "text", text: normalised, marks: [{ type: "link", attrs: { href: normalised } }] }).run()
    } else {
      chain.setLink({ href: normalised }).run()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{current ? "Edit link" : "Add a link"}</DialogTitle>
          <DialogDescription className="text-base">
            {current
              ? "Change where this link points, or clear the address to remove it."
              : "The selected text becomes the link. With nothing selected, the address itself is written in."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            apply()
          }}
        >
          <Label htmlFor="markdown-editor-link-url" className="text-base">
            Address
          </Label>
          <Input
            id="markdown-editor-link-url"
            type="text"
            inputMode="url"
            autoFocus
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setInvalid(false)
            }}
            placeholder="https://example.com"
            aria-invalid={invalid}
            aria-describedby={invalid ? "markdown-editor-link-error" : undefined}
            className="text-base"
          />
          {invalid && (
            <p id="markdown-editor-link-error" role="alert" className="text-base text-destructive">
              Enter a web address such as https://example.com.
            </p>
          )}
          <DialogFooter className="mt-2 gap-2 sm:justify-between">
            <div className="flex gap-2">
              {normalised !== null && (
                <Button type="button" variant="outline" className="gap-1.5" asChild>
                  <a href={normalised} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </a>
                </Button>
              )}
              {current && (
                <Button type="button" variant="outline" onClick={() => setUrl("")}>
                  Remove link
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{current ? "Save" : "Add link"}</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const [linkOpen, setLinkOpen] = useState(false)
  // `useEditor` no longer re-renders on every transaction, so the active states are read through a selector.
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      h1: e.isActive("heading", { level: 1 }),
      h2: e.isActive("heading", { level: 2 }),
      bullets: e.isActive("bulletList"),
      link: e.isActive("link"),
    }),
  })

  return (
    <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 border-b px-1 py-1">
      <ToolbarToggle label="Bold" pressed={active.bold} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
        <Bold />
      </ToolbarToggle>
      <ToolbarToggle label="Italic" pressed={active.italic} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
        <Italic />
      </ToolbarToggle>
      <ToolbarToggle
        label="Title"
        pressed={active.h1}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 />
      </ToolbarToggle>
      <ToolbarToggle
        label="Subtitle"
        pressed={active.h2}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 />
      </ToolbarToggle>
      <ToolbarToggle
        label="Bullet points"
        pressed={active.bullets}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List />
      </ToolbarToggle>
      <ToolbarToggle label="Link" pressed={active.link} onPressedChange={() => setLinkOpen(true)}>
        <Link2 />
      </ToolbarToggle>
      {/* Mounted only while open, so it reads the link under the cursor afresh each time. */}
      {linkOpen && <LinkDialog editor={editor} open={linkOpen} onOpenChange={setLinkOpen} />}
    </div>
  )
}

/** The extensions the editor runs with; exported so the Markdown round trip can be tested headlessly. */
export function markdownEditorExtensions(placeholder = "") {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2] },
      link: { openOnClick: false, defaultProtocol: "https" },
    }),
    Markdown,
    Placeholder.configure({ placeholder }),
  ]
}

export function MarkdownEditor({ value, onChange, placeholder, "aria-label": ariaLabel, className }: MarkdownEditorProps) {
  const editor = useEditor({
    extensions: markdownEditorExtensions(placeholder),
    content: value,
    contentType: "markdown",
    // The app is server-rendered: the editor mounts after hydration to avoid a mismatch.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "min-h-full px-3 py-2 text-base outline-none",
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getMarkdown()),
  })

  return (
    <div
      className={cn(
        "markdown-editor flex min-h-0 flex-col rounded-md border border-input bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-ring",
        className,
      )}
    >
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} className="min-h-0 flex-1 cursor-text overflow-y-auto" onClick={() => editor?.commands.focus()} />
    </div>
  )
}

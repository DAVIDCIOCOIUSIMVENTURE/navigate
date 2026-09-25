import { Editor } from "@tiptap/react"
import { markdownEditorExtensions, normaliseLinkUrl } from "./markdown-editor"

/** A headless editor with the journal's extensions, started from Markdown. */
function editorFrom(markdown: string) {
  return new Editor({ extensions: markdownEditorExtensions(), content: markdown, contentType: "markdown" })
}

describe("MarkdownEditor round trip", () => {
  it("reads and writes the formatting the toolbar offers", () => {
    const markdown = [
      "# Title",
      "",
      "## Subtitle",
      "",
      "Some **bold** and *italic* words with [a link](https://example.com).",
      "",
      "- first point",
      "- second point",
    ].join("\n")
    const editor = editorFrom(markdown)
    expect(editor.getMarkdown()).toBe(markdown)
    editor.destroy()
  })

  it("writes an empty note as empty Markdown", () => {
    const editor = editorFrom("")
    expect(editor.getMarkdown()).toBe("")
    editor.destroy()
  })

  it("serialises what the toolbar commands produce", () => {
    const afterCommand = (run: (editor: Editor) => void) => {
      const editor = editorFrom("plain words")
      editor.commands.selectAll()
      run(editor)
      const markdown = editor.getMarkdown()
      editor.destroy()
      // A block such as a heading is followed by a blank line in the serialised Markdown.
      return markdown.trimEnd()
    }
    expect(afterCommand((e) => e.commands.toggleBold())).toBe("**plain words**")
    expect(afterCommand((e) => e.commands.toggleItalic())).toBe("*plain words*")
    expect(afterCommand((e) => e.commands.toggleHeading({ level: 1 }))).toBe("# plain words")
    expect(afterCommand((e) => e.commands.toggleHeading({ level: 2 }))).toBe("## plain words")
    expect(afterCommand((e) => e.commands.toggleBulletList())).toBe("- plain words")
  })

  it("links the selection", () => {
    const editor = editorFrom("visit here")
    editor.commands.selectAll()
    editor.commands.setLink({ href: "https://example.com/" })
    expect(editor.getMarkdown()).toBe("[visit here](https://example.com/)")
    editor.destroy()
  })
})

describe("normaliseLinkUrl", () => {
  it("accepts web and mail addresses and gives a bare domain https", () => {
    expect(normaliseLinkUrl("https://example.com/page")).toBe("https://example.com/page")
    expect(normaliseLinkUrl("http://example.com")).toBe("http://example.com/")
    expect(normaliseLinkUrl("example.com")).toBe("https://example.com/")
    expect(normaliseLinkUrl("mailto:someone@example.com")).toBe("mailto:someone@example.com")
  })

  it("rejects empty and unsafe addresses", () => {
    expect(normaliseLinkUrl("   ")).toBeNull()
    expect(normaliseLinkUrl("javascript:alert(1)")).toBeNull()
    expect(normaliseLinkUrl("not a url at all")).toBeNull()
  })
})

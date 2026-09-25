/**
 * The plain words in a piece of Markdown, for previews and searches: the
 * heading, emphasis, list and link syntax the journal editor writes is
 * stripped and the text is kept.
 */
export function plainTextFromMarkdown(markdown: string): string {
  return markdown
    .split("\n")
    .map((line) =>
      line
        .replace(/^\s{0,3}#{1,6}\s+/, "") // headings
        .replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "") // list markers
        .replace(/^\s*>\s?/, "") // block quotes
        .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // links and images keep their text
        .replace(/(\*\*|__)(.+?)\1/g, "$2") // bold
        .replace(/(\*|_)(.+?)\1/g, "$2") // italic
        .replace(/~~(.+?)~~/g, "$1") // strikethrough
        .replace(/`([^`]*)`/g, "$1") // inline code
        .replace(/\\([\\`*_{}[\]()#+\-.!>])/g, "$1") // escaped punctuation
        .trim(),
    )
    .filter((line) => line.length > 0)
    .join("\n")
}

import { plainTextFromMarkdown } from "./markdown-text"

describe("plainTextFromMarkdown", () => {
  it("strips headings, emphasis, lists and links but keeps the words", () => {
    const markdown = [
      "# Rainy commutes",
      "",
      "Some **bold** and _italic_ and *starred* text.",
      "",
      "- first point",
      "- second [with a link](https://example.com)",
      "1. numbered",
      "> quoted",
      "`code`",
    ].join("\n")
    expect(plainTextFromMarkdown(markdown)).toBe(
      ["Rainy commutes", "Some bold and italic and starred text.", "first point", "second with a link", "numbered", "quoted", "code"].join(
        "\n",
      ),
    )
  })

  it("drops blank lines and unescapes punctuation", () => {
    expect(plainTextFromMarkdown("\n\nA \\* B\n\n")).toBe("A * B")
  })

  it("leaves plain text alone", () => {
    expect(plainTextFromMarkdown("Just a note")).toBe("Just a note")
    expect(plainTextFromMarkdown("")).toBe("")
  })
})

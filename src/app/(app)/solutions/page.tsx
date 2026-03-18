import { Lightbulb } from "lucide-react"

export default function SolutionsPage() {
  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 shrink-0">
          <Lightbulb className="h-6 w-6 text-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Solutions</h1>
          <p className="text-sm text-muted-foreground">
            Discover and ideate solutions for your validated problems.
          </p>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
          <Lightbulb className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center flex flex-col gap-2 max-w-sm">
          <h2 className="text-lg font-semibold">Coming soon</h2>
          <p className="text-sm text-muted-foreground">
            This section is coming soon. Validate a problem first before exploring and ideating solutions.
          </p>
        </div>
      </div>
    </div>
  )
}

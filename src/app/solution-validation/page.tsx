import { getNavigationItem } from "@/config/navigation"

export default function SolutionValidationPage() {
  const navItem = getNavigationItem("/solution-validation")
  const Icon = navItem?.icon

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        {navItem && Icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg">
            <Icon className="h-6 w-6" />
          </div>
        )}
        <h2 className="text-xl font-bold">Solution Validation</h2>
      </div>
      <p>Welcome to the Solution Validation section.</p>
    </div>
  )
} 
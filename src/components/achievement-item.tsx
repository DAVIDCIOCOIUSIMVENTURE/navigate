import { LucideIcon } from "lucide-react"

interface AchievementItemProps {
  icon: LucideIcon
  title: string
  description: string
  iconBgColor: string
  iconColor: string
}

export function AchievementItem({
  icon: Icon,
  title,
  description,
  iconBgColor,
  iconColor
}: AchievementItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${iconBgColor} shrink-0`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
} 
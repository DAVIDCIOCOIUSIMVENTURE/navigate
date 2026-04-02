import { LucideIcon, Lock } from "lucide-react"

interface AchievementItemProps {
  icon: LucideIcon
  title: string
  description: string
  iconBgColor: string
  iconColor: string
  unlocked?: boolean
}

export function AchievementItem({
  icon: Icon,
  title,
  description,
  iconBgColor,
  iconColor,
  unlocked = true,
}: AchievementItemProps) {
  return (
    <div className={`flex items-start gap-4 ${unlocked ? "" : "opacity-40"}`}>
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${unlocked ? iconBgColor : "bg-muted"} shrink-0`}>
        {unlocked ? (
          <Icon className={`h-4 w-4 ${iconColor}`} />
        ) : (
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

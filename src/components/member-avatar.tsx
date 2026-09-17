"use client"

import type { ProjectMember } from "@/store/projects-model"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { memberAvatarClass, memberDisplayName, memberInitials } from "@/lib/project-team"
import { cn } from "@/lib/utils"

/** One member's initials on a coloured disc. The colour is stable per member. */
export function MemberAvatar({
  member,
  className,
}: {
  member: ProjectMember
  className?: string
}) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white ring-2 ring-background",
        memberAvatarClass(member),
        className,
      )}
      aria-hidden
    >
      {memberInitials(member)}
    </span>
  )
}

/**
 * The team of a project as an overlapping row of avatars, with the names in a
 * tooltip. Shows at most `max` discs and counts the rest in a final one.
 */
export function MemberAvatarStack({
  members,
  max = 4,
  className,
}: {
  members: readonly ProjectMember[]
  max?: number
  className?: string
}) {
  if (members.length === 0) return null

  const shown = members.slice(0, max)
  const hidden = members.length - shown.length
  const names = members.map(memberDisplayName).join(", ")

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("flex items-center -space-x-2", className)} aria-label={`Team: ${names}`}>
          {shown.map((member) => (
            <MemberAvatar key={member.id} member={member} />
          ))}
          {hidden > 0 && (
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-quaternary text-xs font-medium text-quaternary-foreground ring-2 ring-background"
              aria-hidden
            >
              +{hidden}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>{names}</TooltipContent>
    </Tooltip>
  )
}

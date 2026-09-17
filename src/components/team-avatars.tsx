"use client"

import { usePathname } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MemberAvatarStack } from "@/components/member-avatar"
import { projectIdFromPathname } from "@/lib/projects"

const placeholders = [
  { initials: "AK", name: "Anna K.", color: "bg-amber-500" },
  { initials: "JR", name: "James R.", color: "bg-emerald-600" },
  { initials: "ML", name: "Maya L.", color: "bg-[hsl(13_55%_51%)]" },
]

/**
 * The header's team strip. On a project page it shows that project's team (the
 * people added in its settings dialog); everywhere else, and for a project
 * nobody has been added to yet, it falls back to the placeholder faces.
 */
export function TeamAvatars() {
  const pathname = usePathname()
  const projectId = projectIdFromPathname(pathname)
  const members = useSelector((state: RootState) =>
    projectId === null ? undefined : state.projects.projects.find((p) => p.id === projectId)?.members,
  )

  if (members && members.length > 0) {
    return (
      <TooltipProvider>
        <MemberAvatarStack members={members} />
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center -space-x-2 cursor-pointer opacity-50">
            {placeholders.map((member) => (
              <div
                key={member.initials}
                className={`${member.color} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ring-2 ring-background`}
              >
                {member.initials}
              </div>
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Team members (coming soon)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const members = [
  { initials: "AK", name: "Anna K.", color: "bg-violet-500" },
  { initials: "JR", name: "James R.", color: "bg-emerald-500" },
  { initials: "ML", name: "Maya L.", color: "bg-amber-500" },
]

export function TeamAvatars() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center -space-x-2 cursor-pointer opacity-50">
            {members.map((member) => (
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

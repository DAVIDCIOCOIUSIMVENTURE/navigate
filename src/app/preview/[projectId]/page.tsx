"use client"

import { useParams } from "next/navigation"
import { ProjectPreview } from "@/components/preview/project-preview"

/**
 * `/preview/<projectId>`: the read-only account of a project, open to anyone
 * with the link once the project is public. No account and no licence needed.
 */
export default function ProjectPreviewPage() {
  const params = useParams()
  return <ProjectPreview projectId={Number(params.projectId)} />
}

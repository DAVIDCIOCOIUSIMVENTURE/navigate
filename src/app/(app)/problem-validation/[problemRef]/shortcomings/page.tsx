import { redirect } from "next/navigation"

export default function ShortcomingsRedirect({ params }: { params: { problemRef: string } }) {
  redirect(`/problem-validation/${params.problemRef}/alternatives`)
}

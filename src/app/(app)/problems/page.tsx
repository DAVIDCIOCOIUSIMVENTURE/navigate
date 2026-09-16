import { redirect } from "next/navigation"

/** The Problems library was replaced by projects; old links land on the home page. */
export default function ProblemsPage() {
  redirect("/")
}

import { redirect } from "next/navigation"

/** The Solutions library was replaced by projects; old links land on the home page. */
export default function SolutionsPage() {
  redirect("/")
}

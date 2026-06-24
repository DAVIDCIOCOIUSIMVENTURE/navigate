/**
 * Link compatibility shim.
 *
 * A drop-in replacement for `next/link` backed by React Router's `Link`, so
 * existing `<Link href="...">` call sites keep working unchanged. Maps Next's
 * `href` prop onto React Router's `to`, and accepts (and ignores) Next-only
 * props such as `prefetch`.
 */

import { forwardRef } from "react"
import { Link as RouterLink } from "react-router-dom"
import type { ComponentPropsWithoutRef } from "react"

type RouterLinkProps = Omit<ComponentPropsWithoutRef<typeof RouterLink>, "to" | "prefetch">

export interface LinkProps extends RouterLinkProps {
  href: string
  /** Accepted for `next/link` compatibility; has no effect here. */
  prefetch?: boolean
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, prefetch: _prefetch, ...rest },
  ref,
) {
  return <RouterLink ref={ref} to={href} {...rest} />
})

export default Link

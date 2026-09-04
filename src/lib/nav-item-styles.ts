/**
 * Shared active-state styling for flow navigation rows (steppers, section
 * navs, per-flow sidebars).
 *
 * Taken from the method picker board in `src/components/method-picker-board.tsx`:
 * an active row is a light brand tint with brand-coloured text, and inactive
 * rows keep the ghost button's default `hover:bg-accent` treatment. The hover
 * classes are repeated on the active row so hovering it does not swap the tint
 * back out for the accent grey.
 */
export const NAV_ITEM_ACTIVE_CLASS =
  "bg-secondary-brand/10 text-secondary-brand hover:bg-secondary-brand/10 hover:text-secondary-brand"

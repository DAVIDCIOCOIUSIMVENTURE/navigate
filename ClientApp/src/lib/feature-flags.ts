/**
 * UI feature switches.
 *
 * These hide finished functionality from the user without deleting it, so a
 * step can be trialled out of the flow and brought back by flipping one value.
 */

/**
 * Show the "Choose your refinement method" and "Refine your problem" steps in
 * Explore the Problem, plus the Refinement section wherever the captured work
 * is displayed (explore summary, problem hub, guidance panel).
 *
 * Switched off while we assess whether the refinement step earns its place.
 * The underlying workspace fields (analysisToolType, rootCauses, fiveWhyChains,
 * affectedGroups) are still stored and still flow into solution discovery.
 */
export const SHOW_REFINEMENT_STEPS = false

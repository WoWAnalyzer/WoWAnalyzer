import SPECS from 'game/SPECS';

export const BAD_COLOR = 'rgba(228, 20, 20, 0.97)'; // Bright red

/**
 * Spec-specific thematic colors for cooldown bars and good performance indicators.
 * These are intentionally muted (low saturation, lower brightness) to not distract
 * from bad performance indicators.
 */
const SPEC_COLORS: Record<number, string> = {
  // Mage specs
  [SPECS.ARCANE_MAGE.id]: '#6b4a99', // Muted purple
  [SPECS.FIRE_MAGE.id]: '#c96632', // Muted orange
  [SPECS.FROST_MAGE.id]: '#5a9eb8', // Muted cyan-blue

  // Add more specs as needed
};

/**
 * Get the appropriate color for a cooldown bar based on the player's spec.
 * Falls back to a neutral muted blue-grey if spec is not configured.
 *
 * @param specId - The spec ID from the player's combatant
 * @returns A muted, thematic color for the spec
 */
export function getSpecColor(specId: number | undefined): string {
  if (!specId) {
    return '#64748b'; // Tailwind slate-500 - neutral fallback
  }

  return SPEC_COLORS[specId];
}

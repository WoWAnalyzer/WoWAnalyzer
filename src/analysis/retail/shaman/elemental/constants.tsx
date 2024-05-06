/**
 * Grace-period for checking if a buff is applied to the player.  Buffs that are
 * removed on-cast (SK, MotE, SoP) may get removed before the actual spell cast
 * is logged.
 */
export const ON_CAST_BUFF_REMOVAL_GRACE_MS = 50;

/**
 * Width in percentage that the explanation (the left part with text) takes up
 * in the guide section.  For use with `ExplanationAndDataSubSection`.
 */
export const GUIDE_EXPLANATION_PERCENT_WIDTH = 40;

export const ELECTRIFIED_SHOCKS_DURATION = 9000;

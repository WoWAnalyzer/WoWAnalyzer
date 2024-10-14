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

/** Master of the Elements is not currently worth playing around, so it's disabled here instead of the code removed */
export const ENABLE_MOTE_CHECKS = false;

export enum NORMALIZER_ORDER {
  EventLink = 0,
  Prepull = 10,
  EventOrder = 20,
}

export enum EVENT_LINKS {
  Stormkeeper = 'stormkeeper',
  CallOfTheAncestors = 'call-of-the-ancestor',
}

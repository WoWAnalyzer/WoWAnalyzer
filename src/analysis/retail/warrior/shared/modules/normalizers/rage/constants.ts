/**
 * All rage values in events, _except_ "resourceChange" and "waste" values,
 * are x10 scaled. This factor is used to get back to the display value,
 * or to normalize the exceptions to the same scale.
 */
export const RAGE_SCALE_FACTOR = 0.1;

export const WARMACHINE_FURY_INCREASE = 0.2;
export const WARMACHINE_ARMS_INCREASE = 0.1;
export const WARMACHINE_PROT_INCREASE = 0.5;

export const SEASONED_SOLDIER_RAGE_INCREASE = 0.1;

export const RECKLESSNESS_INCREASE = 0.5;
// Since TWW pre-patch, Warlords Torment triggers a longer lasting recklessness, but with a lower rage increase
export const WARLORDS_TORMENT_RECKLESSNESS_INCREASE = 0.25;

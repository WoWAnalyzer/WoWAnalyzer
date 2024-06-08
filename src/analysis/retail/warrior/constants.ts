/**
 * All rage values in events, _except_ "resourceChange" and "waste" values,
 * are x10 scaled. This factor is used to get back to the display value,
 * or to normalize the exceptions to the same scale.
 */
export const RAGE_SCALE_FACTOR = 0.1;

const HIT_TYPES = {
  MISS: 0,
  NORMAL: 1,
  CRIT: 2,
  ABSORB: 3, // seen at Aura of Sacrifice + Absorbed hits that cause atonement
  BLOCKED_NORMAL: 4,
  BLOCKED_CRIT: 5,
  DODGE: 7,
  PARRY: 8,
  IMMUNE: 10,
} as const satisfies Record<string, number>;

export type HitType = (typeof HIT_TYPES)[keyof typeof HIT_TYPES];

export default HIT_TYPES;

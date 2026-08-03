/**
 * Evil Eye of Galakras — Tier 16 (Siege of Orgrimmar) DK DPS trinket.
 *
 * Passive: Readiness (spell 145955) permanently reduces the cooldown of
 * 6 spec-specific abilities by an ilvl-dependent Cooldown Recovery Rate %.
 *
 * Formula: effective_cd = base_cd / (1 + rate/100)
 * where `rate` is the Cooldown Recovery Rate for the player's item level.
 *
 * Frost spells affected: Anti-Magic Shell, Army of the Dead, Empower Rune Weapon,
 *   Icebound Fortitude, Outbreak, Pillar of Frost.
 * Unholy spells affected: Anti-Magic Shell, Army of the Dead, Icebound Fortitude,
 *   Outbreak, Summon Gargoyle, Unholy Frenzy.
 */

/** All item IDs for Evil Eye of Galakras across all quality tiers. */
export const EVIL_EYE_ITEM_IDS = new Set([
  104993, // LFR    528
  102298, // Normal 553
  105242, // Normal Warforged 560
  104495, // Heroic 566
  105491, // Heroic Warforged 572 (matches player from Darkfrog's log)
]);

/**
 * Cooldown Recovery Rate increase (%) indexed by item level.
 * Exact values from wowsims formula:
 *   rate = randPropPoints * 0.00989999995 * slot_factor(~1.34601)
 * Upgrade ilvl increments: LFR/N/H +7 per upgrade; NWF/HWF +4 per upgrade.
 */
export const EVIL_EYE_READINESS_RATE: Record<number, number> = {
  528: 31.0219,
  535: 33.114,
  542: 35.3393, // LFR / LFR+7 / LFR+14
  553: 39.1638,
  560: 41.8022,
  567: 44.6139, // N   / N+7   / N+14
  559: 41.4158,
  563: 42.9882, // NWF / NWF+4 (NWF+8 = 567, shared)
  566: 44.2008,
  573: 47.1858,
  580: 50.3572, // H   / H+7   / H+14
  572: 46.746,
  576: 48.5183, // HWF / HWF+4 (HWF+8 = 580, shared)
};

/**
 * Returns the CD multiplier from Evil Eye of Galakras for the given gear array.
 * effective_cd = base_cd * cdMultiplier(gear)
 *
 * Returns 1.0 if the trinket is not equipped or its ilvl is unrecognised.
 */
export function evilEyeCdMultiplier(gear: { id: number; itemLevel: number }[]): number {
  for (const item of gear) {
    if (EVIL_EYE_ITEM_IDS.has(item.id)) {
      const rate = EVIL_EYE_READINESS_RATE[item.itemLevel] ?? 0;
      if (rate) {
        return 1 / (1 + rate / 100);
      }
    }
  }
  return 1.0;
}

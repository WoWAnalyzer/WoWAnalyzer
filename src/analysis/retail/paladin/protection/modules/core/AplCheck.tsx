import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink, SpellLink } from 'interface';
import { suggestion as buildSuggestion } from 'parser/core/Analyzer';
import aplCheck, { build, tenseAlt } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';

// ===== Helper Conditions =====

/**
 * Checks if the target is in execute range (<20% HP) OR Avenging Wrath is active.
 * Used for Hammer of Wrath.
 */
const hammerOfWrathUsable = cnd.always(
  cnd.or(cnd.inExecute(), cnd.buffPresent(TALENTS.AVENGING_WRATH_TALENT)),
);

const holCastable = cnd.always(cnd.buffPresent(SPELLS.LIGHTS_DELIVERANCE_FREE_CAST_BUFF));

/**
 * Condition for Consecration pandemic window.
 * Refreshes if missing or less than 2 seconds remain (with 12s duration, pandemic cap = 1.3).
 */
const consecrationMissing = cnd.buffMissing(SPELLS.CONSECRATION_BUFF, {
  duration: 12000,
  timeRemaining: 2000,
  pandemicCap: 1.3,
});

/**
 * Condition for using Shield of the Righteous:
 * - 3-5 Holy Power
 * - OR Divine Purpose buff (free cast)
 */
const shieldOfTheRighteousCondition = cnd.or(
  cnd.hasResource(RESOURCE_TYPES.HOLY_POWER, { atLeast: 3, atMost: 5 }, 0),
  cnd.buffPresent(SPELLS.DIVINE_PURPOSE_BUFF),
);

/**
 * Condition for Divine Toll: use when at 0 Holy Power.
 */
const divineTollCondition = cnd.hasResource(RESOURCE_TYPES.HOLY_POWER, { atMost: 0 }, 0);

// ===== APL Rules =====

export const apl = build([
  // 0. Keep Consecration up (if talented into Searing Sunlight)
  {
    spell: SPELLS.CONSECRATION_CAST,
    condition: cnd.and(
      cnd.hasTalent(TALENTS.SEARING_SUNLIGHT_TALENT),
      cnd.optionalRule(consecrationMissing), // optional because it's a maintenance rule
    ),
  },

  // 1. Sacred Weapon (if not inside Avenging Wrath)
  {
    spell: SPELLS.SACRED_WEAPON_TALENT,
    condition: cnd.and(
      cnd.not(cnd.buffPresent(TALENTS.AVENGING_WRATH_TALENT)),
      cnd.spellCharges(SPELLS.SACRED_WEAPON_TALENT, { atLeast: 1 }),
    ),
  },

  // 2. Avenging Wrath (off‑GCD, use on cooldown)
  {
    spell: TALENTS.AVENGING_WRATH_TALENT,
    condition: cnd.and(
      cnd.spellAvailable(TALENTS.AVENGING_WRATH_TALENT),
      cnd.not(cnd.buffPresent(TALENTS.AVENGING_WRATH_TALENT)),
    ),
  },

  // 3. Holy Bulwark – placeholder (requires actual spell ID)
  //    For now we skip because the ability is not defined in the current codebase.
  //    In a real implementation, add:
  //    {
  //      spell: SPELLS.HOLY_BULWARK_TALENT,   // hypothetical ID
  //      condition: cnd.spellCharges(SPELLS.HOLY_BULWARK_TALENT, { atLeast: 1 })
  //    },

  // 4. Shield of the Righteous (when high Holy Power or free)
  {
    spell: SPELLS.SHIELD_OF_THE_RIGHTEOUS,
    condition: shieldOfTheRighteousCondition,
  },

  // 5. Hammer of Wrath (execute or Avenging Wrath)
  {
    spell: TALENTS.HAMMER_OF_WRATH_TALENT,
    condition: cnd.and(hammerOfWrathUsable, cnd.spellAvailable(TALENTS.HAMMER_OF_WRATH_TALENT)),
  },

  // 6. Judgment (single‑target priority)
  {
    spell: SPELLS.JUDGMENT_CAST_PROTECTION,
    condition: cnd.and(
      cnd.spellAvailable(SPELLS.JUDGMENT_CAST_PROTECTION),
      cnd.targetsHit({ atMost: 1 }), // ST only; AOE handled later
    ),
  },

  // 7. Avenger's Shield (single‑target priority, placed before Divine Toll)
  {
    spell: TALENTS.AVENGERS_SHIELD_TALENT,
    condition: cnd.and(
      cnd.spellAvailable(TALENTS.AVENGERS_SHIELD_TALENT),
      cnd.targetsHit({ atMost: 1 }),
    ),
  },

  // 8. Divine Toll (single‑target, at 0 HP)
  {
    spell: TALENTS.DIVINE_TOLL_TALENT,
    condition: cnd.and(divineTollCondition, cnd.targetsHit({ atMost: 1 })),
  },

  // ----- AOE‑specific rules (targets >= 2) -----

  // 6 (AOE) Divine Toll first (if 0 HP)
  {
    spell: TALENTS.DIVINE_TOLL_TALENT,
    condition: cnd.and(divineTollCondition, cnd.targetsHit({ atLeast: 2 })),
  },

  // 7 (AOE) Avenger's Shield
  {
    spell: TALENTS.AVENGERS_SHIELD_TALENT,
    condition: cnd.and(
      cnd.spellAvailable(TALENTS.AVENGERS_SHIELD_TALENT),
      cnd.targetsHit({ atLeast: 2 }),
    ),
  },

  // 8 (AOE) Judgment (only if talented into Sweeping Verdict)
  {
    spell: SPELLS.JUDGMENT_CAST_PROTECTION,
    condition: cnd.and(
      cnd.hasTalent(TALENTS.SWEEPING_VERDICT_TALENT),
      cnd.targetsHit({ atLeast: 2 }),
      cnd.spellAvailable(SPELLS.JUDGMENT_CAST_PROTECTION),
    ),
  },

  // 9. Generators (Blessed Hammer or Hammer of the Righteous)
  {
    spell: [TALENTS.BLESSED_HAMMER_TALENT, TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT],
    condition: cnd.and(
      cnd.spellAvailable(TALENTS.BLESSED_HAMMER_TALENT),
      cnd.spellAvailable(TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT),
    ),
  },

  // 10. Consecration as filler (only if talented into Searing Sunlight and buff is missing)
  {
    spell: SPELLS.CONSECRATION_CAST,
    condition: cnd.and(cnd.hasTalent(TALENTS.SEARING_SUNLIGHT_TALENT), consecrationMissing),
  },

  // (Optional) Word of Glory – defensive, low priority
  // In a real implementation, this would use a health check; for now we omit.
]);

export const check = aplCheck(apl);

export default buildSuggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);
  return undefined;
});

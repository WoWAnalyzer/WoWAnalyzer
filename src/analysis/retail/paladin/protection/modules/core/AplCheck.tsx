import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { suggestion as buildSuggestion } from 'parser/core/Analyzer';
import aplCheck, { build } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import { SpellLink } from 'interface';

// ===== Helper Conditions =====

/**
 * Hammer of Wrath replaces Judgment when Avenging Wrath is active,
 * or when Sanctified Wrath is taken and Sentinel is active.
 */
const hammerOfWrathCondition = cnd.or(
  cnd.buffPresent(TALENTS.AVENGING_WRATH_TALENT),
  cnd.and(cnd.hasTalent(TALENTS.SANCTIFIED_WRATH_TALENT), cnd.buffPresent(TALENTS.SENTINEL_TALENT)),
);

const holCastable = cnd.always(cnd.buffPresent(SPELLS.LIGHTS_DELIVERANCE_FREE_CAST_BUFF));

/**
 * Consecration should be refreshed if missing or less than 2 seconds remain.
 * Duration depends on Consecration in Flame talent.
 */
const consecrationMissing = cnd.or(
  cnd.and(
    cnd.hasTalent(TALENTS.CONSECRATION_IN_FLAME_TALENT),
    cnd.buffMissing(SPELLS.CONSECRATION_BUFF, {
      duration: 14000, // 12s + 2s
      timeRemaining: 2000,
      pandemicCap: 1.3,
    }),
  ),
  cnd.and(
    cnd.not(cnd.hasTalent(TALENTS.CONSECRATION_IN_FLAME_TALENT)),
    cnd.buffMissing(SPELLS.CONSECRATION_BUFF, {
      duration: 12000,
      timeRemaining: 2000,
      pandemicCap: 1.3,
    }),
  ),
);

/**
 * Shield of the Righteous condition: 3-5 Holy Power OR Divine Purpose buff.
 */
const shieldOfTheRighteousCondition = cnd.or(
  cnd.hasResource(RESOURCE_TYPES.HOLY_POWER, { atLeast: 3, atMost: 5 }, 0),
  cnd.buffPresent(SPELLS.DIVINE_PURPOSE_BUFF),
);

/**
 * Divine Toll is used when Holy Power is 0, to avoid overcapping.
 */
const divineTollCondition = cnd.hasResource(RESOURCE_TYPES.HOLY_POWER, { atMost: 0 }, 0);

// ===== APL Rules =====

export const apl = build([
  // 0. Keep Consecration up – maintenance rule (optional)
  {
    spell: SPELLS.CONSECRATION_CAST,
    condition: cnd.and(
      cnd.hasTalent(TALENTS.SEARING_SUNLIGHT_TALENT),
      cnd.optionalRule(consecrationMissing),
    ),
  },

  // 1. Holy Bulwark – only if talented into Lightsmith
  {
    spell: SPELLS.HOLY_BULWARK_TALENT,
    condition: cnd.and(
      cnd.hasTalent(TALENTS.HOLY_ARMAMENTS_TALENT),
      cnd.spellCharges(SPELLS.HOLY_BULWARK_TALENT, { atLeast: 1 }),
    ),
  },

  // 2. Sacred Weapon – not during Avenging Wrath
  {
    spell: SPELLS.SACRED_WEAPON_TALENT,
    condition: cnd.and(
      cnd.not(cnd.buffPresent(TALENTS.AVENGING_WRATH_TALENT)),
      cnd.spellCharges(SPELLS.SACRED_WEAPON_TALENT, { atLeast: 1 }),
    ),
  },

  // 3. Avenging Wrath / Sentinel – use on cooldown
  {
    spell: TALENTS.AVENGING_WRATH_TALENT,
    condition: cnd.and(
      cnd.spellAvailable(TALENTS.AVENGING_WRATH_TALENT),
      cnd.not(cnd.buffPresent(TALENTS.AVENGING_WRATH_TALENT)),
    ),
  },
  {
    spell: TALENTS.SENTINEL_TALENT,
    condition: cnd.and(
      cnd.spellAvailable(TALENTS.SENTINEL_TALENT),
      cnd.not(cnd.buffPresent(TALENTS.SENTINEL_TALENT)),
    ),
  },

  // 4. Shield of the Righteous
  {
    spell: SPELLS.SHIELD_OF_THE_RIGHTEOUS,
    condition: shieldOfTheRighteousCondition,
  },

  // 5. Hammer of Wrath (replaces Judgment during buff)
  {
    spell: TALENTS.HAMMER_OF_WRATH_TALENT,
    condition: cnd.and(hammerOfWrathCondition, cnd.spellAvailable(TALENTS.HAMMER_OF_WRATH_TALENT)),
  },

  // ----- Single Target priority -----
  {
    spell: SPELLS.JUDGMENT_CAST_PROTECTION,
    condition: cnd.and(
      cnd.not(hammerOfWrathCondition),
      cnd.spellAvailable(SPELLS.JUDGMENT_CAST_PROTECTION),
      cnd.targetsHit({ atMost: 1 }),
    ),
  },
  {
    spell: TALENTS.AVENGERS_SHIELD_TALENT,
    condition: cnd.and(
      cnd.spellAvailable(TALENTS.AVENGERS_SHIELD_TALENT),
      cnd.targetsHit({ atMost: 1 }),
    ),
  },
  {
    spell: TALENTS.DIVINE_TOLL_TALENT,
    condition: cnd.and(divineTollCondition, cnd.targetsHit({ atMost: 1 })),
  },

  // ----- AoE priority (targets ≥ 2) -----
  {
    spell: TALENTS.DIVINE_TOLL_TALENT,
    condition: cnd.and(divineTollCondition, cnd.targetsHit({ atLeast: 2 })),
  },
  {
    spell: TALENTS.AVENGERS_SHIELD_TALENT,
    condition: cnd.and(
      cnd.spellAvailable(TALENTS.AVENGERS_SHIELD_TALENT),
      cnd.targetsHit({ atLeast: 2 }),
    ),
  },
  {
    spell: SPELLS.JUDGMENT_CAST_PROTECTION,
    condition: cnd.and(
      cnd.not(hammerOfWrathCondition),
      cnd.hasTalent(TALENTS.SWEEPING_VERDICT_TALENT),
      cnd.targetsHit({ atLeast: 2 }),
      cnd.spellAvailable(SPELLS.JUDGMENT_CAST_PROTECTION),
    ),
  },

  // ----- Generators -----
  {
    spell: [TALENTS.BLESSED_HAMMER_TALENT, TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT],
    condition: cnd.and(
      cnd.spellAvailable(TALENTS.BLESSED_HAMMER_TALENT),
      cnd.spellAvailable(TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT),
    ),
  },

  // ----- Filler -----
  {
    spell: SPELLS.CONSECRATION_CAST,
    condition: cnd.and(cnd.hasTalent(TALENTS.SEARING_SUNLIGHT_TALENT), consecrationMissing),
  },
]);

export const check = aplCheck(apl);

export default buildSuggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);
  return undefined;
});

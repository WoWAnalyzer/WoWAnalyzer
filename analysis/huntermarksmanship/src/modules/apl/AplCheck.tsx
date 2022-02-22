import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { WIPSuggestionFactory } from 'parser/core/CombatLogParser';
import { EventType } from 'parser/core/Events';
import aplCheck, { build } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import {
  and,
  buffMissing,
  buffPresent,
  debuffMissing,
  debuffPresent,
  hasCovenant,
  hasLegendary,
  hasResource,
  hasTalent,
  inExecute,
  lastSpellCast,
  not,
  or,
  spellAvailable,
  spellCooldownRemaining,
  targetsHit,
} from 'parser/shared/metrics/apl/conditions';

export const apl = build([
  {
    spell: SPELLS.STEADY_SHOT,
    condition: and(
      hasTalent(SPELLS.STEADY_FOCUS_TALENT),
      lastSpellCast(SPELLS.STEADY_SHOT),
      buffMissing(SPELLS.STEADY_FOCUS_BUFF, { timeRemaining: 5000, duration: 15000 }),
    ),
  },
  {
    spell: SPELLS.STEADY_SHOT,
    condition: and(hasTalent(SPELLS.STEADY_FOCUS_TALENT), buffMissing(SPELLS.STEADY_FOCUS_BUFF)),
  },
  {
    spell: SPELLS.KILL_SHOT_MM_BM,
    condition: inExecute(0.2),
  },
  {
    spell: SPELLS.KILL_SHOT_MM_BM,
    condition: buffPresent(SPELLS.FLAYERS_MARK),
  },
  {
    spell: SPELLS.DOUBLE_TAP_TALENT,
    condition: and(
      hasCovenant(COVENANTS.KYRIAN),
      spellCooldownRemaining(SPELLS.RESONATING_ARROW, { atMost: 1500 }),
    ),
  },
  {
    spell: SPELLS.DOUBLE_TAP_TALENT,
    condition: and(
      hasCovenant(COVENANTS.NIGHT_FAE),
      spellCooldownRemaining(SPELLS.WILD_SPIRITS, { atLeast: 30000 }),
    ),
  },
  {
    spell: SPELLS.DOUBLE_TAP_TALENT,
    condition: and(
      hasCovenant(COVENANTS.NIGHT_FAE),
      spellCooldownRemaining(SPELLS.WILD_SPIRITS, { atMost: 1500 }),
    ),
  },
  {
    spell: SPELLS.DOUBLE_TAP_TALENT,
    condition: and(
      not(hasCovenant(COVENANTS.NIGHT_FAE, true), false),
      not(hasCovenant(COVENANTS.KYRIAN, true), false),
    ),
  },
  {
    spell: SPELLS.FLARE,
    condition: and(
      hasLegendary(SPELLS.SOULFORGE_EMBERS_EFFECT),
      not(spellAvailable(SPELLS.TAR_TRAP, true), false),
    ),
  },
  {
    spell: SPELLS.TAR_TRAP,
    condition: and(
      hasLegendary(SPELLS.SOULFORGE_EMBERS_EFFECT),
      spellCooldownRemaining(SPELLS.FLARE, { atMost: 1500 }),
    ),
  },
  SPELLS.EXPLOSIVE_SHOT_TALENT,
  SPELLS.FLAYED_SHOT,
  {
    spell: SPELLS.DEATH_CHAKRAM_INITIAL_AND_AOE,
    condition: hasResource(RESOURCE_TYPES.FOCUS, { atMost: 80 }),
  },
  SPELLS.A_MURDER_OF_CROWS_TALENT,
  SPELLS.WAILING_ARROW_CAST,
  {
    spell: SPELLS.VOLLEY_TALENT,
    condition: debuffPresent(SPELLS.RESONATING_ARROW_DEBUFF),
  },
  {
    spell: SPELLS.VOLLEY_TALENT,
    condition: and(
      not(hasCovenant(COVENANTS.KYRIAN, true), false),
      buffMissing(SPELLS.PRECISE_SHOTS),
    ),
  },
  {
    spell: SPELLS.RAPID_FIRE,
    condition: and(hasLegendary(SPELLS.SURGING_SHOTS_EFFECT), hasTalent(SPELLS.STREAMLINE_TALENT)),
  },
  {
    spell: SPELLS.AIMED_SHOT,
    condition: or(buffMissing(SPELLS.PRECISE_SHOTS), buffPresent(SPELLS.TRUESHOT)),
  },
  {
    spell: SPELLS.AIMED_SHOT,
    condition: and(
      buffPresent(SPELLS.TRICK_SHOTS_BUFF),
      targetsHit(
        { atLeast: 2 },
        { lookahead: 1000, targetType: EventType.Damage, targetSpell: SPELLS.AIMED_SHOT },
      ),
    ),
  },
  {
    spell: SPELLS.RAPID_FIRE,
    condition: hasResource(RESOURCE_TYPES.FOCUS, { atMost: 80 }),
  },
  {
    spell: SPELLS.CHIMAERA_SHOT_TALENT_MARKSMANSHIP,
    condition: or(
      buffPresent(SPELLS.PRECISE_SHOTS),
      hasResource(RESOURCE_TYPES.FOCUS, { atLeast: 55 }),
    ),
  },
  {
    spell: SPELLS.ARCANE_SHOT,
    condition: or(
      buffPresent(SPELLS.PRECISE_SHOTS),
      hasResource(RESOURCE_TYPES.FOCUS, { atLeast: 55 }),
    ),
  },
  {
    spell: SPELLS.SERPENT_STING_TALENT,
    condition: debuffMissing(SPELLS.SERPENT_STING_TALENT, { timeRemaining: 6000, duration: 18000 }),
  },
  {
    spell: SPELLS.BARRAGE_TALENT,
    condition: targetsHit(
      { atLeast: 2 },
      { lookahead: 1000, targetType: EventType.Damage, targetSpell: SPELLS.BARRAGE_DAMAGE },
    ),
  },
  SPELLS.STEADY_SHOT,
]);

export const check = aplCheck(apl);

const mmApl = (): WIPSuggestionFactory => (events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
};
export default mmApl;

import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { suggestion } from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import aplCheck, { build } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import {
  and,
  buffMissing,
  buffPresent,
  debuffMissing,
  hasResource,
  hasTalent,
  inExecute,
  lastSpellCast,
  or,
  targetsHit,
} from 'parser/shared/metrics/apl/conditions';

export const apl = build([
  {
    spell: SPELLS.STEADY_SHOT,
    condition: and(
      hasTalent(TALENTS_HUNTER.STEADY_FOCUS_TALENT),
      lastSpellCast(SPELLS.STEADY_SHOT),
      buffMissing(SPELLS.STEADY_FOCUS_BUFF, { timeRemaining: 5000, duration: 15000 }),
    ),
  },
  {
    spell: SPELLS.STEADY_SHOT,
    condition: and(
      hasTalent(TALENTS_HUNTER.STEADY_FOCUS_TALENT),
      buffMissing(SPELLS.STEADY_FOCUS_BUFF),
    ),
  },
  {
    spell: SPELLS.KILL_SHOT_MM_BM,
    condition: inExecute(0.2),
  },
  TALENTS_HUNTER.EXPLOSIVE_SHOT_TALENT,
  {
    spell: TALENTS_HUNTER.DEATH_CHAKRAM_TALENT,
    condition: hasTalent(TALENTS_HUNTER.DEATH_CHAKRAM_TALENT),
  },
  {
    spell: TALENTS_HUNTER.WAILING_ARROW_TALENT,
    condition: hasTalent(TALENTS_HUNTER.WAILING_ARROW_TALENT),
  },
  {
    spell: TALENTS_HUNTER.VOLLEY_TALENT,
    condition: hasTalent(TALENTS_HUNTER.VOLLEY_TALENT),
  },
  {
    spell: SPELLS.RAPID_FIRE,
    condition: and(
      hasTalent(TALENTS_HUNTER.SURGING_SHOTS_TALENT),
      hasTalent(TALENTS_HUNTER.STREAMLINE_TALENT),
    ),
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
    spell: TALENTS_HUNTER.CHIMAERA_SHOT_TALENT,
    condition: and(
      hasTalent(TALENTS_HUNTER.CHIMAERA_SHOT_TALENT),
      or(buffPresent(SPELLS.PRECISE_SHOTS), hasResource(RESOURCE_TYPES.FOCUS, { atLeast: 55 })),
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
    spell: TALENTS_HUNTER.SERPENT_STING_TALENT,
    condition: and(
      hasTalent(TALENTS_HUNTER.SERPENT_STING_TALENT),
      debuffMissing(TALENTS_HUNTER.SERPENT_STING_TALENT, { timeRemaining: 6000, duration: 18000 }),
    ),
  },
  {
    spell: TALENTS_HUNTER.BARRAGE_TALENT,
    condition: and(
      hasTalent(TALENTS_HUNTER.BARRAGE_TALENT),
      targetsHit(
        { atLeast: 2 },
        { lookahead: 1000, targetType: EventType.Damage, targetSpell: SPELLS.BARRAGE_DAMAGE },
      ),
    ),
  },
  SPELLS.STEADY_SHOT,
]);

export const check = aplCheck(apl);

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});

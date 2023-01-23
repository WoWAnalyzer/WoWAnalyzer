import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import { suggestion as buildSuggestion } from 'parser/core/Analyzer';
import aplCheck, { build } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';

const howCastable = cnd.always(cnd.or(cnd.inExecute(), cnd.buffPresent(SPELLS.AVENGING_WRATH)));

export const apl = build([
  {
    spell: SPELLS.CONSECRATION_CAST,
    condition: cnd.optional(
      cnd.buffMissing(SPELLS.CONSECRATION_BUFF),
      <>
        <SpellLink id={SPELLS.CONSECRATION_CAST} /> is a potent defensive buff that you should
        maintain as often as possible. We cannot automatically determine if it is safe for you to
        drop the buff.
      </>,
      '(if actively tanking)',
    ),
  },
  {
    spell: TALENTS.AVENGERS_SHIELD_TALENT,
    condition: cnd.targetsHit(
      { atLeast: 3 },
      {
        lookahead: 1000,
      },
    ),
  },
  {
    spell: SPELLS.SHIELD_OF_THE_RIGHTEOUS,
    condition: cnd.optional(
      cnd.hasResource(RESOURCE_TYPES.HOLY_POWER, { atLeast: 3 }),
      <>
        <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS} /> should be maintained while actively
        tanking and cast while not tanking to avoid capping Holy Power. We cannot automatically
        determine whether you are pooling resources prior to taking the boss back.
      </>,
      false,
    ),
  },
  {
    spell: TALENTS.HAMMER_OF_WRATH_TALENT,
    condition: cnd.and(cnd.hasTalent(TALENTS.ZEALOTS_PARAGON_TALENT), howCastable),
  },
  TALENTS.AVENGERS_SHIELD_TALENT,
  SPELLS.JUDGMENT_CAST_PROTECTION,
  TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT,
  SPELLS.CONSECRATION_CAST,
]);

export const check = aplCheck(apl);

export default buildSuggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});

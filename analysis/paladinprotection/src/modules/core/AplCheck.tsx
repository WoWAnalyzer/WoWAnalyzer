import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import { WIPSuggestionFactory } from 'parser/core/CombatLogParser';
import aplCheck, { build } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import React from 'react';

export const apl = build([
  {
    spell: SPELLS.CONSECRATION_CAST,
    condition: cnd.optional(
      cnd.buffMissing(SPELLS.CONSECRATION_BUFF),
      <>
        <SpellLink id={SPELLS.CONSECRATION_CAST.id} /> is a potent defensive buff that you should
        maintain as often as possible. We cannot automatically determine if it is safe for you to
        drop the buff.
      </>,
      false,
    ),
  },
  {
    spell: SPELLS.SHIELD_OF_THE_RIGHTEOUS,
    condition: cnd.optional(
      cnd.hasResource(RESOURCE_TYPES.HOLY_POWER, { atLeast: 3 }),
      <>
        <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> should be maintained while actively
        tanking and cast while not tanking to avoid capping Holy Power. We cannot automatically
        determine whether you are pooling resources prior to taking the boss back.
      </>,
      false,
    ),
  },
  {
    spell: SPELLS.HAMMER_OF_WRATH,
    condition: cnd.and(
      cnd.hasLegendary(SPELLS.THE_MAD_PARAGON),
      cnd.or(cnd.inExecute(), cnd.buffPresent(SPELLS.AVENGING_WRATH)),
    ),
  },
  SPELLS.JUDGMENT_CAST_PROTECTION,
  {
    spell: SPELLS.HAMMER_OF_WRATH,
    condition: cnd.always(cnd.or(cnd.inExecute(), cnd.buffPresent(SPELLS.AVENGING_WRATH))),
  },
  SPELLS.AVENGERS_SHIELD,
  SPELLS.HAMMER_OF_THE_RIGHTEOUS,
  SPELLS.CONSECRATION_CAST,
]);

export const check = aplCheck(apl);

const suggestion = (): WIPSuggestionFactory => (events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
};

export default suggestion;

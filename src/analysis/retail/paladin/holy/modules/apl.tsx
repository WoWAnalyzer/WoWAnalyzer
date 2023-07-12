import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, Rule } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import TALENTS from 'common/TALENTS/paladin';
import * as cnd from 'parser/shared/metrics/apl/conditions';

import { AnyEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

const inWings = cnd.buffPresent(TALENTS.AVENGING_CRUSADER_TALENT);

const APL: Rule[] = [
  {
    spell: SPELLS.JUDGMENT_CAST_HOLY,
    condition: inWings,
  },
  {
    spell: SPELLS.WORD_OF_GLORY,
    condition: cnd.and(
      inWings,
      cnd.hasResource(RESOURCE_TYPES.HOLY_POWER, { atLeast: 5 }),
      cnd.buffPresent(TALENTS.EMPYREAN_LEGACY_TALENT),
    ),
  },
  {
    spell: TALENTS.LIGHT_OF_DAWN_TALENT,
    condition: cnd.and(inWings, cnd.hasResource(RESOURCE_TYPES.HOLY_POWER, { atLeast: 5 })),
  },
  {
    spell: SPELLS.CRUSADER_STRIKE,
    condition: cnd.and(
      inWings,
      cnd.hasResource(RESOURCE_TYPES.HOLY_POWER, { atMost: 4 }),
      cnd.or(
        cnd.spellCharges(SPELLS.CRUSADER_STRIKE, { atLeast: 2 }),
        cnd.and(
          cnd.spellCharges(SPELLS.CRUSADER_STRIKE, { atLeast: 1 }),
          cnd.spellCooldownRemaining(SPELLS.CRUSADER_STRIKE, { atMost: 2 }),
        ),
      ),
    ),
  },
  {
    spell: TALENTS.LIGHTS_HAMMER_TALENT,
    condition: inWings,
  },
  {
    spell: TALENTS.HOLY_SHOCK_TALENT,
    condition: cnd.and(inWings, cnd.hasResource(RESOURCE_TYPES.HOLY_POWER, { atMost: 2 })),
  },
  { spell: SPELLS.CRUSADER_STRIKE, condition: inWings },
  { spell: TALENTS.HOLY_SHOCK_TALENT, condition: inWings },
  {
    spell: TALENTS.LIGHT_OF_DAWN_TALENT,
    condition: cnd.and(inWings, cnd.hasResource(RESOURCE_TYPES.HOLY_POWER, { atLeast: 4 })),
  },
  { spell: TALENTS.HAMMER_OF_WRATH_TALENT, condition: inWings },
  {
    spell: TALENTS.LIGHT_OF_DAWN_TALENT,
    condition: cnd.and(inWings, cnd.hasResource(RESOURCE_TYPES.HOLY_POWER, { atLeast: 3 })),
  },
];

const default_rotation = build(APL);

export const apl = (): Apl => {
  return default_rotation;
};

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl());
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});

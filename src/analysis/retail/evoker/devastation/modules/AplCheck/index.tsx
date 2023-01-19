import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, Rule } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import TALENTS from 'common/TALENTS/evoker';
import * as cnd from 'parser/shared/metrics/apl/conditions';

import { AnyEvent, EventType } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

const avoidIfDragonRageSoon = (time: number) => {
  return cnd.spellCooldownRemaining(TALENTS.DRAGONRAGE_TALENT, { atLeast: time });
};

const hasEssenceRequirement = (resources: number) => {
  return cnd.or(
    cnd.hasResource(RESOURCE_TYPES.ESSENCE, { atLeast: resources }),
    cnd.buffPresent(SPELLS.ESSENCE_BURST_DEV_BUFF),
  );
};

const COMMON_TOP: Rule[] = [
  {
    spell: SPELLS.FIRE_BREATH,
    condition: avoidIfDragonRageSoon(10000),
  },
  {
    spell: SPELLS.FIRE_BREATH_FONT,
    condition: avoidIfDragonRageSoon(10000),
  },
  {
    spell: TALENTS.SHATTERING_STAR_TALENT,
    condition: cnd.hasTalent(TALENTS.SHATTERING_STAR_TALENT),
  },
  {
    spell: SPELLS.ETERNITY_SURGE,
    condition: avoidIfDragonRageSoon(15000),
  },
  {
    spell: SPELLS.ETERNITY_SURGE_FONT,
    condition: avoidIfDragonRageSoon(15000),
  },
];

export const COMMON_BOTTOM: Rule[] = [
  {
    spell: SPELLS.LIVING_FLAME_CAST,
    condition: cnd.buffPresent(TALENTS.BURNOUT_TALENT),
  },
  {
    spell: SPELLS.AZURE_STRIKE,
    condition: cnd.targetsHit(
      { atLeast: 3 },
      { lookahead: 1000, targetType: EventType.Damage, targetSpell: SPELLS.AZURE_STRIKE },
    ),
  },
  {
    spell: SPELLS.AZURE_STRIKE,
    condition: cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT),
  },
  SPELLS.LIVING_FLAME_CAST,
];

const default_rotation = build([
  ...COMMON_TOP,

  {
    spell: TALENTS.PYRE_TALENT,
    condition: cnd.and(
      hasEssenceRequirement(2),
      cnd.targetsHit(
        { atLeast: 3 },
        { lookahead: 2000, targetType: EventType.Damage, targetSpell: SPELLS.PYRE },
      ),
    ),
  },
  {
    spell: SPELLS.DISINTEGRATE,
    condition: hasEssenceRequirement(3),
  },
  ...COMMON_BOTTOM,
]);

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

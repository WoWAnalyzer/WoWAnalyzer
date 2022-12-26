import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, build, CheckResult, PlayerInfo } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import TALENTS from 'common/TALENTS/evoker';
import * as cnd from 'parser/shared/metrics/apl/conditions';

import { AnyEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

const avoidIfDragonRageSoon = (time: number) => {
  return cnd.spellCooldownRemaining(TALENTS.DRAGONRAGE_TALENT, { atLeast: time });
};

const default_rotation = build([
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
  {
    spell: SPELLS.DISINTEGRATE,
    condition: cnd.or(
      cnd.hasResource(RESOURCE_TYPES.ESSENCE, { atLeast: 3 }),
      cnd.buffPresent(TALENTS.ESSENCE_BURST_TALENT),
    ),
  },
  SPELLS.DISINTEGRATE,
  SPELLS.LIVING_FLAME_CAST,
  SPELLS.LIVING_FLAME_DAMAGE,
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

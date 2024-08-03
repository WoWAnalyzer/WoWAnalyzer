import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, Rule } from 'parser/shared/metrics/apl';
import {
  and,
  or,
  buffPresent,
  hasResource,
  debuffMissing,
} from 'parser/shared/metrics/apl/conditions';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

const ENABLE_APL = false; // disabled while Icefury isn't logged properly

export const apl = (info: PlayerInfo): Apl => {
  if (!ENABLE_APL) {
    return build([]);
  }

  const combatant = info.combatant;
  const maelstromCap = 100 + (combatant.hasTalent(TALENTS.SWELLING_MAELSTROM_TALENT) ? 50 : 0) - 20;
  const minRequiredEBMaelstrom =
    90 - (combatant.hasTalent(TALENTS.EYE_OF_THE_STORM_TALENT) ? 5 : 0);
  const rules: Rule[] = [];
  rules.push(
    {
      spell: SPELLS.FLAME_SHOCK,
      condition: debuffMissing(SPELLS.FLAME_SHOCK),
    },
    {
      spell: TALENTS.LAVA_BURST_TALENT,
      condition: or(
        buffPresent(SPELLS.LAVA_SURGE),
        buffPresent(TALENTS.ASCENDANCE_ELEMENTAL_TALENT),
      ),
    },
    {
      spell: TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT,
      condition: or(
        hasResource(RESOURCE_TYPES.MAELSTROM, { atLeast: maelstromCap }),
        and(
          hasResource(RESOURCE_TYPES.MAELSTROM, { atLeast: minRequiredEBMaelstrom }, 0),
          buffPresent(TALENTS.MASTER_OF_THE_ELEMENTS_ELEMENTAL_TALENT),
        ),
      ),
    },
    TALENTS.LAVA_BURST_TALENT,
    {
      spell: SPELLS.ICEFURY,
      condition: buffPresent(SPELLS.ICEFURY_CASTABLE_BUFF),
    },
    {
      spell: TALENTS.FROST_SHOCK_TALENT,
      condition: and(
        buffPresent(SPELLS.ICEFURY),
        buffPresent(TALENTS.MASTER_OF_THE_ELEMENTS_ELEMENTAL_TALENT),
      ),
    },
    SPELLS.LIGHTNING_BOLT,
  );
  return build(rules);
};

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl(info));
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});

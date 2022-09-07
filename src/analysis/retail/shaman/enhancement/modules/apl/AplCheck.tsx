import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { build } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import {
  and,
  buffPresent,
  buffStacks,
  debuffMissing,
  debuffPresent,
  hasTalent,
} from 'parser/shared/metrics/apl/conditions';

/**
 * Based on https://www.icy-veins.com/wow/enhancement-shaman-pve-dps-guide
 */
export const apl = build([
  {
    spell: SPELLS.LAVA_LASH,
    condition: buffPresent(SPELLS.HOT_HAND_BUFF),
  },
  {
    spell: SPELLS.FLAME_SHOCK,
    condition: debuffMissing(SPELLS.FLAME_SHOCK),
  },
  {
    spell: SPELLS.FROST_SHOCK,
    condition: buffStacks(SPELLS.HAILSTORM_TALENT, { atLeast: 1 }),
  },
  {
    spell: SPELLS.ELEMENTAL_BLAST_TALENT,
    condition: buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
  },
  {
    spell: SPELLS.STORMSTRIKE_CAST,
    condition: and(hasTalent(SPELLS.STORMFLURRY_TALENT), buffPresent(SPELLS.STORMBRINGER_BUFF)),
  },
  {
    spell: SPELLS.LIGHTNING_BOLT,
    condition: buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 10 }),
  },
  SPELLS.STORMSTRIKE_CAST,
  SPELLS.LAVA_LASH,
  SPELLS.SUNDERING_TALENT,
  {
    spell: SPELLS.LIGHTNING_BOLT,
    condition: buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
  },
  SPELLS.FROST_SHOCK,
  SPELLS.CRASH_LIGHTNING,
  SPELLS.ICE_STRIKE_TALENT,
  {
    spell: SPELLS.FIRE_NOVA_TALENT,
    condition: debuffPresent(SPELLS.FLAME_SHOCK),
  },
]);

export const check = aplCheck(apl);

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});

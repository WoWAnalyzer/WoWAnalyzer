import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { build } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
// import SPELLS from 'common/SPELLS';
// import { and, buffPresent, buffStacks, debuffMissing, hasTalent } from 'parser/shared/metrics/apl/conditions';
// import { TALENTS_SHAMAN } from 'common/TALENTS';

/**
 * Based on https://www.icy-veins.com/wow/enhancement-shaman-pve-dps-guide
 */
export const apl = build([
  // {
  //   spell: TALENTS_SHAMAN.LAVA_LASH_TALENT,
  //   condition: buffPresent(SPELLS.HOT_HAND_BUFF),
  // },
  // {
  //   spell: SPELLS.FLAME_SHOCK,
  //   condition: debuffMissing(SPELLS.FLAME_SHOCK),
  // },
  // {
  //   spell: TALENTS_SHAMAN.FROST_SHOCK_TALENT,
  //   condition: buffStacks(TALENTS_SHAMAN.HAILSTORM_TALENT, { atLeast: 1 }),
  // },
  // {
  //   spell: TALENTS_SHAMAN.ELEMENTAL_BLAST_ENHANCEMENT_TALENT,
  //   condition: buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
  // },
  // {
  //   spell: TALENTS_SHAMAN.STORMSTRIKE_TALENT,
  //   condition: and(hasTalent(TALENTS_SHAMAN.STORMFLURRY_TALENT), buffPresent(SPELLS.STORMBRINGER_BUFF)),
  // },
  // {
  //   spell: SPELLS.LIGHTNING_BOLT,
  //   condition: buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 10 }),
  // },
  // TALENTS_SHAMAN.STORMSTRIKE_TALENT,
  // TALENTS_SHAMAN.LAVA_LASH_TALENT,
  // TALENTS_SHAMAN.SUNDERING_TALENT,
  // {
  //   spell: SPELLS.LIGHTNING_BOLT,
  //   condition: buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
  // },
  // TALENTS_SHAMAN.FROST_SHOCK_TALENT,
  // TALENTS_SHAMAN.CRASH_LIGHTNING_TALENT,
  // TALENTS_SHAMAN.ICE_STRIKE_TALENT,
  // {
  //   spell: TALENTS_SHAMAN.FIRE_NOVA_TALENT,
  //   condition: debuffPresent(SPELLS.FLAME_SHOCK),
  // },
]);

export const check = aplCheck(apl);

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});

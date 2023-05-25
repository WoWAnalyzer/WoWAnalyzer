import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { CheckResult, PlayerInfo, build } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import {
  and,
  buffMissing,
  buffPresent,
  or,
  buffStacks,
  not,
  hasTalent,
  hasSetBonus,
  debuffMissing,
  spellCharges,
} from 'parser/shared/metrics/apl/conditions';
import talents, { TALENTS_SHAMAN } from 'common/TALENTS/shaman';
import { TIERS } from 'game/TIERS';
import { AnyEvent } from 'parser/core/Events';

const atLeastFiveMSW = buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 });

/**
 * Based on https://www.icy-veins.com/wow/enhancement-shaman-pve-dps-guide
 */

function commonBottom() {
  if (hasTalent(talents.HAILSTORM_TALENT)) {
    return [
      talents.ICE_STRIKE_TALENT,
      {
        spell: talents.FROST_SHOCK_TALENT,
        condition: buffStacks(talents.HAILSTORM_TALENT, { atLeast: 1 }),
      },
      talents.LAVA_LASH_TALENT,
    ];
  } else {
    return [talents.LAVA_LASH_TALENT, talents.ICE_STRIKE_TALENT, talents.FROST_SHOCK_TALENT];
  }
}

export const apl = build([
  talents.FERAL_SPIRIT_TALENT,
  {
    spell: talents.PRIMORDIAL_WAVE_TALENT,
    condition: and(debuffMissing(SPELLS.FLAME_SHOCK), hasTalent(talents.LASHING_FLAMES_TALENT)),
  },
  talents.ASCENDANCE_ENHANCEMENT_TALENT,
  talents.DOOM_WINDS_TALENT,
  {
    spell: talents.SUNDERING_TALENT,
    condition: and(hasSetBonus(TIERS.T30, 2)),
  },
  {
    spell: SPELLS.WINDSTRIKE_CAST,
    condition: buffPresent(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT),
  },
  {
    spell: talents.STORMSTRIKE_TALENT,
    condition: hasTalent(talents.DEEPLY_ROOTED_ELEMENTS_TALENT),
  },
  {
    spell: talents.LAVA_LASH_TALENT,
    condition: buffPresent(talents.HOT_HAND_TALENT),
  },
  {
    spell: talents.ELEMENTAL_BLAST_TALENT,
    condition: and(
      atLeastFiveMSW,
      spellCharges(talents.ELEMENTAL_BLAST_TALENT, { atLeast: 2, atMost: 2 }),
    ),
  },
  {
    spell: SPELLS.LIGHTNING_BOLT,
    condition: and(hasTalent(talents.PRIMORDIAL_WAVE_TALENT), atLeastFiveMSW),
  },
  {
    spell: talents.CHAIN_LIGHTNING_TALENT,
    condition: and(buffPresent(SPELLS.CRACKLING_THUNDER_BUFF_T30_4PC), atLeastFiveMSW),
  },
  {
    spell: talents.ELEMENTAL_BLAST_TALENT,
    condition: and(atLeastFiveMSW, spellCharges(talents.ELEMENTAL_BLAST_TALENT, { atLeast: 1 })),
  },
  {
    spell: talents.ELEMENTAL_BLAST_TALENT,
    condition: and(
      hasTalent(talents.ELEMENTAL_BLAST_TALENT),
      hasTalent(talents.ELEMENTAL_SPIRITS_TALENT),
      atLeastFiveMSW,
      or(
        buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON),
        buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE),
        buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE),
      ),
    ),
  },
  {
    spell: SPELLS.LIGHTNING_BOLT,
    condition: and(hasTalent(talents.STATIC_ACCUMULATION_TALENT), atLeastFiveMSW),
  },
  {
    spell: SPELLS.LIGHTNING_BOLT,
    condition: and(
      not(hasTalent(talents.STATIC_ACCUMULATION_TALENT)),
      buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 10 }),
    ),
  },
  {
    spell: talents.ICE_STRIKE_TALENT,
    condition: buffPresent(talents.DOOM_WINDS_TALENT),
  },
  {
    spell: talents.WINDFURY_TOTEM_TALENT,
    condition: buffMissing(talents.WINDFURY_TOTEM_TALENT),
  },
  talents.PRIMORDIAL_WAVE_TALENT,
  {
    spell: talents.LAVA_LASH_TALENT,
    condition: buffStacks(talents.ASHEN_CATALYST_TALENT, { atLeast: 6 }),
  },
  {
    spell: SPELLS.FLAME_SHOCK,
    condition: buffMissing(SPELLS.FLAME_SHOCK),
  },
  ...commonBottom(),
]);

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl);
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});

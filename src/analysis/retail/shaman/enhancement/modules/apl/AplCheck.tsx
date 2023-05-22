import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { CheckResult, PlayerInfo, build } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import talents from 'common/TALENTS/shaman';
import { TIERS } from 'game/TIERS';
import { AnyEvent } from 'parser/core/Events';

const atLeastFiveMSW = cnd.buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 });

/**
 * Based on https://www.icy-veins.com/wow/enhancement-shaman-pve-dps-guide
 */

function commonBottom() {
  if (cnd.hasTalent(talents.HAILSTORM_TALENT)) {
    return [
      talents.ICE_STRIKE_TALENT,
      {
        spell: talents.FROST_SHOCK_TALENT,
        condition: cnd.buffStacks(talents.HAILSTORM_TALENT, { atLeast: 1 }),
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
    condition: cnd.and(
      cnd.hasTalent(talents.PRIMORDIAL_WAVE_TALENT),
      cnd.debuffMissing(SPELLS.FLAME_SHOCK),
      cnd.hasTalent(talents.LASHING_FLAMES_TALENT),
    ),
  },
  {
    spell: talents.ASCENDANCE_ENHANCEMENT_TALENT,
    condition: cnd.hasTalent(talents.ASCENDANCE_ENHANCEMENT_TALENT),
  },
  talents.DOOM_WINDS_TALENT,
  {
    spell: talents.SUNDERING_TALENT,
    condition: cnd.and(cnd.hasSetBonus(TIERS.T30, 2)),
  },
  {
    spell: SPELLS.WINDSTRIKE_CAST,
    condition: cnd.and(cnd.buffPresent(talents.ASCENDANCE_ENHANCEMENT_TALENT)),
  },
  {
    spell: talents.STORMSTRIKE_TALENT,
    condition: cnd.hasTalent(talents.DEEPLY_ROOTED_ELEMENTS_TALENT),
  },
  {
    spell: talents.LAVA_LASH_TALENT,
    condition: cnd.buffPresent(talents.HOT_HAND_TALENT),
  },
  {
    spell: talents.ELEMENTAL_BLAST_TALENT,
    condition: cnd.and(
      atLeastFiveMSW,
      cnd.spellCharges(talents.ELEMENTAL_BLAST_TALENT, { atLeast: 2, atMost: 2 }),
    ),
  },
  {
    spell: SPELLS.LIGHTNING_BOLT,
    condition: cnd.and(cnd.hasTalent(talents.PRIMORDIAL_WAVE_TALENT), atLeastFiveMSW),
  },
  {
    spell: talents.CHAIN_LIGHTNING_TALENT,
    condition: cnd.and(cnd.buffPresent(SPELLS.CRACKLING_THUNDER_BUFF_T30_4PC), atLeastFiveMSW),
  },
  {
    spell: talents.ELEMENTAL_BLAST_TALENT,
    condition: cnd.and(
      atLeastFiveMSW,
      cnd.spellCharges(talents.ELEMENTAL_BLAST_TALENT, { atLeast: 1 }),
    ),
  },
  {
    spell: talents.ELEMENTAL_BLAST_TALENT,
    condition: cnd.and(
      cnd.hasTalent(talents.ELEMENTAL_BLAST_TALENT),
      cnd.hasTalent(talents.ELEMENTAL_SPIRITS_TALENT),
      atLeastFiveMSW,
      cnd.or(
        cnd.buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON),
        cnd.buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE),
        cnd.buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE),
      ),
    ),
  },
  {
    spell: SPELLS.LIGHTNING_BOLT,
    condition: cnd.and(cnd.hasTalent(talents.STATIC_ACCUMULATION_TALENT), atLeastFiveMSW),
  },
  {
    spell: SPELLS.LIGHTNING_BOLT,
    condition: cnd.and(
      cnd.not(cnd.hasTalent(talents.STATIC_ACCUMULATION_TALENT)),
      cnd.buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 10 }),
    ),
  },
  {
    spell: talents.ICE_STRIKE_TALENT,
    condition: cnd.buffPresent(talents.DOOM_WINDS_TALENT),
  },
  {
    spell: talents.WINDFURY_TOTEM_TALENT,
    condition: cnd.buffMissing(talents.WINDFURY_TOTEM_TALENT),
  },
  talents.PRIMORDIAL_WAVE_TALENT,
  {
    spell: talents.LAVA_LASH_TALENT,
    condition: cnd.buffStacks(talents.ASHEN_CATALYST_TALENT, { atLeast: 6 }),
  },
  {
    spell: SPELLS.FLAME_SHOCK,
    condition: cnd.buffMissing(SPELLS.FLAME_SHOCK),
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

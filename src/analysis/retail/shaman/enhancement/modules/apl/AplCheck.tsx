import { TALENTS_SHAMAN } from 'common/TALENTS';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, { Apl, build, CheckResult, PlayerInfo } from 'parser/shared/metrics/apl';
import {
  and,
  buffPresent,
  or,
  buffStacks,
  debuffMissing,
  spellCharges,
  describe,
  buffMissing,
  always,
} from 'parser/shared/metrics/apl/conditions';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import { SpellLink } from 'interface';
import spells from 'common/SPELLS/shaman';
import {
  chainLightningWithCracklingThunder,
  sunderingToActivateEarthenMight,
} from '../tiersets/RunesOfTheCinderwolf';

/**
 * Based on https://www.icy-veins.com/wow/enhancement-shaman-pve-dps-guide
 */

const commonTop = [
  {
    spell: TALENTS_SHAMAN.PRIMORDIAL_WAVE_TALENT,
    condition: debuffMissing(spells.FLAME_SHOCK),
  },
  TALENTS_SHAMAN.FERAL_SPIRIT_TALENT,
  TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT,
  TALENTS_SHAMAN.DOOM_WINDS_TALENT,
  sunderingToActivateEarthenMight(),
];

const commonEnd = [
  {
    spell: spells.FLAME_SHOCK,
    condition: describe(
      debuffMissing(spells.FLAME_SHOCK, { duration: 18, timeRemaining: 18 }),
      () => <></>,
      '',
    ),
  },
];

export const apl = (info: PlayerInfo): Apl => {
  if (info.combatant.hasTalent(TALENTS_SHAMAN.HOT_HAND_TALENT)) {
    return build(elementalistCore(info));
  } else {
    return build(stormCore(info));
  }
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

const elementalistCore = (info: PlayerInfo) => {
  return [
    ...commonTop,
    spells.WINDSTRIKE_CAST,
    {
      spell: TALENTS_SHAMAN.LAVA_LASH_TALENT,
      condition: buffPresent(spells.HOT_HAND_BUFF),
    },
    {
      spell: TALENTS_SHAMAN.ELEMENTAL_BLAST_TALENT,
      condition: or(
        and(
          buffStacks(spells.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
          spellCharges(TALENTS_SHAMAN.ELEMENTAL_BLAST_TALENT, { atLeast: 2, atMost: 2 }),
        ),
        describe(
          or(
            buffPresent(spells.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE),
            buffPresent(spells.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON),
            buffPresent(spells.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE),
          ),
          () => (
            <>
              <SpellLink spell={TALENTS_SHAMAN.ELEMENTAL_SPIRITS_TALENT} /> are active
            </>
          ),
          '',
        ),
      ),
    },
    {
      spell: spells.LIGHTNING_BOLT,
      condition: and(
        buffStacks(spells.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
        buffPresent(TALENTS_SHAMAN.PRIMORDIAL_WAVE_TALENT),
      ),
    },
    chainLightningWithCracklingThunder(),
    {
      spell: TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT,
      condition: buffStacks(spells.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
    },
    TALENTS_SHAMAN.PRIMORDIAL_WAVE_TALENT,
    {
      spell: TALENTS_SHAMAN.LAVA_LASH_TALENT,
      condition: buffStacks(TALENTS_SHAMAN.ASHEN_CATALYST_TALENT, { atLeast: 6 }),
    },
    TALENTS_SHAMAN.ICE_STRIKE_TALENT,
    {
      spell: TALENTS_SHAMAN.FROST_SHOCK_TALENT,
      condition: buffPresent(TALENTS_SHAMAN.HAILSTORM_TALENT),
    },
    TALENTS_SHAMAN.LAVA_LASH_TALENT,
    TALENTS_SHAMAN.STORMSTRIKE_TALENT,
    TALENTS_SHAMAN.FROST_SHOCK_TALENT,
    TALENTS_SHAMAN.CRASH_LIGHTNING_TALENT,
    ...commonEnd,
  ];
};

const stormCore = (info: PlayerInfo) => {
  return [
    ...commonTop,
    {
      spell: spells.WINDSTRIKE_CAST,
      condition: describe(
        always(buffPresent(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT)),
        () => <></>,
        '',
      ),
    },
    {
      spell: TALENTS_SHAMAN.STORMSTRIKE_TALENT,
      condition: describe(
        buffMissing(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT),
        () => <></>,
        '',
      ),
    },
    {
      spell: TALENTS_SHAMAN.ELEMENTAL_BLAST_TALENT,
      condition: and(
        buffStacks(spells.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
        spellCharges(TALENTS_SHAMAN.ELEMENTAL_BLAST_TALENT, { atLeast: 2, atMost: 2 }),
      ),
    },
    chainLightningWithCracklingThunder(),
    {
      spell: TALENTS_SHAMAN.ELEMENTAL_BLAST_TALENT,
      condition: buffStacks(spells.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
    },
    {
      spell: spells.LIGHTNING_BOLT,
      condition: buffStacks(spells.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
    },
    {
      spell: TALENTS_SHAMAN.ICE_STRIKE_TALENT,
      condition: buffPresent(TALENTS_SHAMAN.DOOM_WINDS_TALENT),
    },
    {
      spell: TALENTS_SHAMAN.CRASH_LIGHTNING_TALENT,
      condition: buffPresent(TALENTS_SHAMAN.DOOM_WINDS_TALENT),
    },
    {
      spell: spells.FLAME_SHOCK,
      condition: debuffMissing(spells.FLAME_SHOCK),
    },
    TALENTS_SHAMAN.LAVA_LASH_TALENT,
    TALENTS_SHAMAN.ICE_STRIKE_TALENT,
    TALENTS_SHAMAN.FROST_SHOCK_TALENT,
    ...commonEnd,
  ];
};

import TALENTS from 'common/TALENTS/shaman';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, Rule } from 'parser/shared/metrics/apl';
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
import SPELLS from 'common/SPELLS';
import {
  chainLightningWithCracklingThunder,
  sunderingToActivateEarthenMight,
} from '../dragonflight/Tier30';

/**
 * Based on https://www.icy-veins.com/wow/enhancement-shaman-pve-dps-guide
 */

const commonTop = [
  {
    spell: TALENTS.PRIMORDIAL_WAVE_TALENT,
    condition: debuffMissing(SPELLS.FLAME_SHOCK),
  },
  TALENTS.FERAL_SPIRIT_TALENT,
  TALENTS.ASCENDANCE_ENHANCEMENT_TALENT,
  TALENTS.DOOM_WINDS_TALENT,
  sunderingToActivateEarthenMight(),
];

const commonEnd = [
  {
    spell: SPELLS.FLAME_SHOCK,
    condition: describe(
      debuffMissing(SPELLS.FLAME_SHOCK, { duration: 18, timeRemaining: 18 }),
      () => <></>,
      '',
    ),
  },
];

export const apl = (info: PlayerInfo): Apl => {
  if (info.combatant.hasTalent(TALENTS.HOT_HAND_TALENT)) {
    return build(elementalistCore());
  } else {
    return build(stormCore());
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

const elementalistCore = () => {
  return [
    ...commonTop,
    SPELLS.WINDSTRIKE_CAST,
    {
      spell: TALENTS.LAVA_LASH_TALENT,
      condition: buffPresent(SPELLS.HOT_HAND_BUFF),
    },
    {
      spell: TALENTS.ELEMENTAL_BLAST_TALENT,
      condition: or(
        and(
          buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
          spellCharges(TALENTS.ELEMENTAL_BLAST_TALENT, { atLeast: 2, atMost: 2 }),
        ),
        describe(
          or(
            buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE),
            buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON),
            buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE),
          ),
          () => (
            <>
              <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> are active
            </>
          ),
          '',
        ),
      ),
    },
    {
      spell: SPELLS.LIGHTNING_BOLT,
      condition: and(
        buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
        buffPresent(TALENTS.PRIMORDIAL_WAVE_TALENT),
      ),
    },
    chainLightningWithCracklingThunder(),
    {
      spell: TALENTS.CHAIN_LIGHTNING_TALENT,
      condition: buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
    },
    TALENTS.PRIMORDIAL_WAVE_TALENT,
    {
      spell: TALENTS.LAVA_LASH_TALENT,
      condition: buffStacks(TALENTS.ASHEN_CATALYST_TALENT, { atLeast: 6 }),
    },
    TALENTS.ICE_STRIKE_TALENT,
    {
      spell: TALENTS.FROST_SHOCK_TALENT,
      condition: buffPresent(TALENTS.HAILSTORM_TALENT),
    },
    TALENTS.LAVA_LASH_TALENT,
    TALENTS.STORMSTRIKE_TALENT,
    TALENTS.FROST_SHOCK_TALENT,
    TALENTS.CRASH_LIGHTNING_TALENT,
    ...commonEnd,
  ];
};

const stormCore = (): Rule[] => {
  return [
    ...commonTop,
    {
      spell: SPELLS.WINDSTRIKE_CAST,
      condition: describe(
        always(buffPresent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT)),
        () => <></>,
        '',
      ),
    },
    {
      spell: TALENTS.STORMSTRIKE_TALENT,
      condition: describe(buffMissing(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT), () => <></>, ''),
    },
    {
      spell: TALENTS.ELEMENTAL_BLAST_TALENT,
      condition: and(
        buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
        spellCharges(TALENTS.ELEMENTAL_BLAST_TALENT, { atLeast: 2, atMost: 2 }),
      ),
    },
    chainLightningWithCracklingThunder(),
    {
      spell: TALENTS.ELEMENTAL_BLAST_TALENT,
      condition: buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
    },
    {
      spell: SPELLS.LIGHTNING_BOLT,
      condition: buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
    },
    {
      spell: TALENTS.ICE_STRIKE_TALENT,
      condition: buffPresent(TALENTS.DOOM_WINDS_TALENT),
    },
    {
      spell: TALENTS.CRASH_LIGHTNING_TALENT,
      condition: buffPresent(TALENTS.DOOM_WINDS_TALENT),
    },
    {
      spell: SPELLS.FLAME_SHOCK,
      condition: debuffMissing(SPELLS.FLAME_SHOCK),
    },
    TALENTS.LAVA_LASH_TALENT,
    TALENTS.ICE_STRIKE_TALENT,
    TALENTS.FROST_SHOCK_TALENT,
    ...commonEnd,
  ];
};

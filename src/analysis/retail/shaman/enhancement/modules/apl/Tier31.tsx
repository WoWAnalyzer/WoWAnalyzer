import { Rule } from 'parser/shared/metrics/apl';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import {
  and,
  buffPresent,
  debuffMissing,
  describe,
  spellCharges,
} from 'parser/shared/metrics/apl/conditions';
import { minimumMaelstromWeaponStacks } from 'analysis/retail/shaman/enhancement/modules/apl/Conditions';
import SpellLink from 'interface/SpellLink';

export function getTier31ElementalistApl(): Rule[] {
  return [
    {
      spell: SPELLS.FLAME_SHOCK,
      condition: debuffMissing(SPELLS.FLAME_SHOCK),
    },
    {
      spell: TALENTS.LAVA_LASH_TALENT,
      condition: buffPresent(SPELLS.HOT_HAND_BUFF),
    },
    {
      spell: TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT,
      condition: and(
        minimumMaelstromWeaponStacks(5),
        spellCharges(TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT, { atLeast: 2, atMost: 2 }),
      ),
    },
    {
      spell: SPELLS.LIGHTNING_BOLT,
      condition: and(buffPresent(SPELLS.PRIMORDIAL_WAVE_BUFF), minimumMaelstromWeaponStacks(8)),
    },
    {
      spell: TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT,
      condition: and(
        minimumMaelstromWeaponStacks(8),
        buffPresent(SPELLS.FERAL_SPIRIT_MAELSTROM_BUFF),
      ),
    },
    {
      spell: SPELLS.LIGHTNING_BOLT,
      condition: minimumMaelstromWeaponStacks(10),
    },
    TALENTS.ICE_STRIKE_TALENT,
    {
      spell: TALENTS.FROST_SHOCK_TALENT,
      condition: buffPresent(SPELLS.HAILSTORM_BUFF),
    },
    TALENTS.LAVA_LASH_TALENT,
    TALENTS.STORMSTRIKE_TALENT,
    {
      spell: SPELLS.LIGHTNING_BOLT,
      condition: describe(minimumMaelstromWeaponStacks(5), () => (
        <>
          you have at least 5 <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks for{' '}
          <SpellLink spell={TALENTS.HAILSTORM_TALENT} />
        </>
      )),
    },
    TALENTS.FROST_SHOCK_TALENT,
    TALENTS.CRASH_LIGHTNING_TALENT,
  ];
}

export function getTier31StormApl(): Rule[] {
  return [
    {
      spell: SPELLS.WINDSTRIKE_CAST,
      condition: buffPresent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT),
    },
    TALENTS.STORMSTRIKE_TALENT,
    {
      spell: SPELLS.LIGHTNING_BOLT,
      condition: minimumMaelstromWeaponStacks(5),
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
    TALENTS.CRASH_LIGHTNING_TALENT,
    TALENTS.FROST_SHOCK_TALENT,
  ];
}

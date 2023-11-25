import { Rule } from 'parser/shared/metrics/apl';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import { MinimumMaelstromWeaponStacks } from 'analysis/retail/shaman/enhancement/modules/apl/Conditions';
import SpellLink from 'interface/SpellLink';

export function getTier31ElementalistApl(): Rule[] {
  return [
    {
      spell: SPELLS.FLAME_SHOCK,
      condition: cnd.debuffMissing(SPELLS.FLAME_SHOCK),
    },
    {
      spell: TALENTS.LAVA_LASH_TALENT,
      condition: cnd.buffPresent(SPELLS.HOT_HAND_BUFF),
    },
    {
      spell: TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT,
      condition: cnd.and(
        MinimumMaelstromWeaponStacks(5),
        cnd.spellCharges(TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT, { atLeast: 2, atMost: 2 }),
      ),
    },
    {
      spell: SPELLS.LIGHTNING_BOLT,
      condition: cnd.and(
        cnd.buffPresent(SPELLS.PRIMORDIAL_WAVE_BUFF),
        MinimumMaelstromWeaponStacks(5),
      ),
    },
    {
      spell: TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT,
      condition: cnd.and(
        MinimumMaelstromWeaponStacks(8),
        cnd.buffPresent(SPELLS.FERAL_SPIRIT_MAELSTROM_BUFF),
      ),
    },
    {
      spell: SPELLS.LIGHTNING_BOLT,
      condition: MinimumMaelstromWeaponStacks(10),
    },
    TALENTS.ICE_STRIKE_TALENT,
    {
      spell: TALENTS.FROST_SHOCK_TALENT,
      condition: cnd.buffPresent(SPELLS.HAILSTORM_BUFF),
    },
    TALENTS.LAVA_LASH_TALENT,
    TALENTS.STORMSTRIKE_TALENT,
    {
      spell: SPELLS.LIGHTNING_BOLT,
      condition: cnd.describe(MinimumMaelstromWeaponStacks(5), () => (
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
  return [];
}

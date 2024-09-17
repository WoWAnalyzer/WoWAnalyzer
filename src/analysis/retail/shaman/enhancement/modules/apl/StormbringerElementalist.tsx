import Combatant from 'parser/core/Combatant';
import { Apl, build, Rule } from 'parser/shared/metrics/apl';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import SpellLink from 'interface/SpellLink';
import {
  and,
  buffPresent,
  repeatableBuffPresent,
  debuffMissing,
  describe,
  or,
  spellCharges,
} from 'parser/shared/metrics/apl/conditions';
import { MaxStacksMSW, minimumMaelstromWeaponStacks, AtLeastFiveMSW } from './Conditions';

export function stormbringerElementalist(combatant: Combatant): Apl {
  const rules: Rule[] = [
    {
      spell: SPELLS.TEMPEST_CAST,
      condition: describe(and(buffPresent(SPELLS.TEMPEST_BUFF), MaxStacksMSW), () => (
        <>
          available and at 10 <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks
        </>
      )),
    },
    {
      spell: SPELLS.WINDSTRIKE_CAST,
      condition: describe(
        and(buffPresent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT), AtLeastFiveMSW),
        () => (
          <>
            during <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} />
          </>
        ),
        '',
      ),
    },
    {
      spell: TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT,
      condition: or(
        describe(
          and(
            AtLeastFiveMSW,
            spellCharges(TALENTS.ELEMENTAL_BLAST_ENHANCEMENT_TALENT, { atLeast: 2, atMost: 2 }),
          ),
          () => <>you are capped on charges</>,
        ),
        and(
          minimumMaelstromWeaponStacks(8),
          repeatableBuffPresent(
            [
              SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON,
              SPELLS.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE,
              SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE,
            ],
            { atLeast: 4 },
          ),
        ),
      ),
    },
    {
      spell: SPELLS.TEMPEST_CAST,
      condition: describe(
        and(buffPresent(SPELLS.TEMPEST_BUFF), minimumMaelstromWeaponStacks(6)),
        () => (
          <>
            available and at least 5 <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks
          </>
        ),
      ),
    },
    {
      spell: SPELLS.LIGHTNING_BOLT,
      condition: MaxStacksMSW,
    },
    {
      spell: SPELLS.FLAME_SHOCK,
      condition: debuffMissing(SPELLS.FLAME_SHOCK),
    },
    {
      spell: TALENTS.LAVA_LASH_TALENT,
      condition: buffPresent(SPELLS.HOT_HAND_BUFF),
    },
    {
      spell: SPELLS.LIGHTNING_BOLT,
      condition: AtLeastFiveMSW,
    },
    TALENTS.ICE_STRIKE_TALENT,
    {
      spell: TALENTS.FROST_SHOCK_TALENT,
      condition: buffPresent(SPELLS.HAILSTORM_BUFF),
    },
    TALENTS.LAVA_LASH_TALENT,
    TALENTS.STORMSTRIKE_TALENT,
    TALENTS.SUNDERING_TALENT,
    TALENTS.CRASH_LIGHTNING_TALENT,
    SPELLS.FLAME_SHOCK,
  ];

  return build(rules);
}

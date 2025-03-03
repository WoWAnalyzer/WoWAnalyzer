import {
  and,
  buffPresent,
  describe,
  hasResource,
  not,
  repeatableBuffPresent,
} from 'parser/shared/metrics/apl/conditions';
import { Condition, Rule } from 'parser/shared/metrics/apl';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Combatant from 'parser/core/Combatant';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import SpellLink from 'interface/SpellLink';

export const AtLeastFiveMSW = hasResource(RESOURCE_TYPES.MAELSTROM_WEAPON, { atLeast: 5 });
export const MaxStacksMSW = hasResource(RESOURCE_TYPES.MAELSTROM_WEAPON, {
  atLeast: 10,
});

export function minimumMaelstromWeaponStacks(minStacks: number): Condition<number> {
  return hasResource(RESOURCE_TYPES.MAELSTROM_WEAPON, {
    atLeast: minStacks,
  });
}

export function getSpenderBlock(combatant: Combatant): Rule[] {
  const rules: Rule[] = [];

  if (combatant.hasTalent(TALENTS.ELEMENTAL_SPIRITS_TALENT)) {
    rules.push({
      spell: TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT,
      condition: and(
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
    });
  }

  rules.push({
    spell: SPELLS.LIGHTNING_BOLT,
    condition: describe(
      and(minimumMaelstromWeaponStacks(8), not(buffPresent(SPELLS.TEMPEST_BUFF))),
      () => (
        <>
          you have at least 8 <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks
        </>
      ),
    ),
  });

  return rules;
}

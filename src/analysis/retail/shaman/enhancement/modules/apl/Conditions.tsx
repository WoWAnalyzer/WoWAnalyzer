import { and, buffPresent, describe, hasResource, not } from 'parser/shared/metrics/apl/conditions';
import { Condition, Rule } from 'parser/shared/metrics/apl';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Combatant from 'parser/core/Combatant';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import SpellLink from 'interface/SpellLink';
import { ResourceInformation } from 'parser/shared/metrics/apl/conditions/hasResource';

export const AtLeastFiveMSW = hasResource(RESOURCE_TYPES.MAELSTROM_WEAPON, { atLeast: 5 });
export const MaxStacksMSW = hasResource(RESOURCE_TYPES.MAELSTROM_WEAPON, {
  atLeast: 10,
});

export const MINIMUM_MAELSTROM_WEAPON_SPEND_STACKS = 9;

export function minimumMaelstromWeaponStacks(minStacks: number): Condition<ResourceInformation> {
  return hasResource(RESOURCE_TYPES.MAELSTROM_WEAPON, {
    atLeast: minStacks,
  });
}

export function getSpenderBlock(combatant: Combatant): Rule[] {
  const rules: Rule[] = [];

  if (combatant.hasTalent(TALENTS.ELEMENTAL_SPIRITS_TALENT)) {
    rules.push({
      spell: TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT,
      condition: minimumMaelstromWeaponStacks(MINIMUM_MAELSTROM_WEAPON_SPEND_STACKS),
    });
  }

  rules.push({
    spell: SPELLS.LIGHTNING_BOLT,
    condition: describe(
      and(
        minimumMaelstromWeaponStacks(MINIMUM_MAELSTROM_WEAPON_SPEND_STACKS),
        not(buffPresent(SPELLS.TEMPEST_BUFF)),
      ),
      () => (
        <>
          you have at least {MINIMUM_MAELSTROM_WEAPON_SPEND_STACKS}{' '}
          <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks
        </>
      ),
    ),
  });

  return rules;
}

export const iceStrikeRule = (combatant: Combatant) =>
  combatant.hasTalent(TALENTS.ICE_STRIKE_1_ENHANCEMENT_TALENT)
    ? {
        spell: SPELLS.ICE_STRIKE_1_CAST,
        condition: buffPresent(SPELLS.ICE_STRIKE_1_USABLE_BUFF),
      }
    : TALENTS.ICE_STRIKE_2_ENHANCEMENT_TALENT;

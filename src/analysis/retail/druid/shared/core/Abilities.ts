import SPELLS from 'common/SPELLS';
import Combatant from 'parser/core/Combatant';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { TALENTS_DRUID as TALENTS } from 'common/TALENTS/druid';

export const druidGcd = (c: Combatant) => (c.hasBuff(SPELLS.CAT_FORM.id) ? 1000 : 1500);

/**
 * Base Druid abilites and talents from the class tree.
 */
class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: [
          // TODO with affinities gone, we need to check these IDs
          SPELLS.HEART_OF_THE_WILD_BALANCE_AFFINITY.id,
          SPELLS.HEART_OF_THE_WILD_FERAL_AFFINITY.id,
          SPELLS.HEART_OF_THE_WILD_GUARDIAN_AFFINITY.id,
          SPELLS.HEART_OF_THE_WILD_RESTO_AFFINITY.id,
        ],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 300,
        gcd: {
          base: druidGcd,
        },
        enabled: combatant.hasTalent(TALENTS.HEART_OF_THE_WILD_TALENT.id),
      },
      {
        spell: [
          SPELLS.STAMPEDING_ROAR_HUMANOID.id,
          SPELLS.STAMPEDING_ROAR_CAT.id,
          SPELLS.STAMPEDING_ROAR_BEAR.id,
        ],
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
        gcd: {
          base: druidGcd,
        },
        isDefensive: true,
        timelineSortIndex: 44,
      },
    ];
  }
}

export default Abilities;

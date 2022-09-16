import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Combatant from 'parser/core/Combatant';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
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
        spell: SPELLS.CONVOKE_SPIRITS.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: {
          base: druidGcd,
        },
        enabled: combatant.hasCovenant(COVENANTS.NIGHT_FAE.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        timelineSortIndex: 100,
      },
      {
        spell: SPELLS.ADAPTIVE_SWARM.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 25,
        gcd: {
          base: druidGcd,
        },
        enabled: combatant.hasCovenant(COVENANTS.NECROLORD.id),
        healSpellIds: [SPELLS.ADAPTIVE_SWARM_HEAL.id],
      },
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
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
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

import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import SPECS from 'game/SPECS';
import Combatant from 'parser/core/Combatant';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';

/**
 * Fully shared Druid abilites should go here
 */
class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.CONVOKE_SPIRITS,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        gcd: {
          base: (c: Combatant) => (c.spec === SPECS.FERAL_DRUID ? 1000 : 1500),
        },
        enabled: combatant.hasCovenant(COVENANTS.NIGHT_FAE.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        timelineSortIndex: 100,
      },
      {
        spell: SPELLS.ADAPTIVE_SWARM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 25,
        gcd: {
          base: (c: Combatant) => (c.spec === SPECS.FERAL_DRUID ? 1000 : 1500),
        },
        enabled: combatant.hasCovenant(COVENANTS.NECROLORD.id),
        healSpellIds: [SPELLS.ADAPTIVE_SWARM_HEAL.id],
      },
      {
        spell: [
          SPELLS.HEART_OF_THE_WILD_BALANCE_AFFINITY,
          SPELLS.HEART_OF_THE_WILD_FERAL_AFFINITY,
          SPELLS.HEART_OF_THE_WILD_GUARDIAN_AFFINITY,
          SPELLS.HEART_OF_THE_WILD_RESTO_AFFINITY,
        ],
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 300,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.HEART_OF_THE_WILD_TALENT.id),
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
    ];
  }
}

export default Abilities;

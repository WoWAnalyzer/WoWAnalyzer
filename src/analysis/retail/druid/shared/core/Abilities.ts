import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Combatant from 'parser/core/Combatant';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

export const druidGcd = (c: Combatant) => (c.hasBuff(SPELLS.CAT_FORM.id) ? 1000 : 1500);

/**
 * Fully shared Druid abilites should go here
 */
class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.CONVOKE_SPIRITS.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasLegendary(SPELLS.CELESTIAL_SPIRITS) ? 60 : 120,
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
        spell: SPELLS.SOULSHAPE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: druidGcd,
        },
        enabled: combatant.hasCovenant(COVENANTS.NIGHT_FAE.id),
      },
      {
        spell: SPELLS.RAVENOUS_FRENZY.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: null,
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        timelineSortIndex: 100,
      },
      {
        spell: SPELLS.DOOR_OF_SHADOWS.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: druidGcd,
        },
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
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
        spell: SPELLS.FLESHCRAFT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: {
          base: druidGcd,
        },
        enabled: combatant.hasCovenant(COVENANTS.NECROLORD.id),
      },
      {
        spell: [
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
        enabled: combatant.hasTalent(SPELLS.HEART_OF_THE_WILD_TALENT.id),
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

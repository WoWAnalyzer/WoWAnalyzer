import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import CoreAbilities from 'analysis/retail/mage/shared/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // Rotational spells
      {
        spell: SPELLS.ARCANE_BLAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        damageSpellIds: [SPELLS.ARCANE_BLAST.id],
      },
      {
        spell: SPELLS.FROSTBOLT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        damageSpellIds: [SPELLS.FROSTBOLT_DAMAGE.id],
      },
      {
        spell: TALENTS.ARCANE_MISSILES_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.ARCANE_MISSILES_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.ARCANE_BARRAGE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.ARCANE_BARRAGE_TALENT),
        cooldown: (haste: any) => 3 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ARCANE_EXPLOSION.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.SUPERNOVA_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.SUPERNOVA_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 25,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.NETHER_TEMPEST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.NETHER_TEMPEST_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.ARCANE_ORB_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        enabled: combatant.hasTalent(TALENTS.ARCANE_ORB_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 20,
        charges: 1 + combatant.getTalentRank(TALENTS.CHARGED_ORB_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        damageSpellIds: [SPELLS.ARCANE_ORB_DAMAGE.id],
      },

      // Cooldowns
      {
        spell: TALENTS.ARCANE_FAMILIAR_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS.ARCANE_FAMILIAR_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 10,
      },
      {
        spell: TALENTS.TOUCH_OF_THE_MAGI_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.TOUCH_OF_THE_MAGI_TALENT),
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.ARCANE_SURGE_TALENT.id,
        buffSpellId: TALENTS.ARCANE_SURGE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS.ARCANE_SURGE_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.EVOCATION_TALENT.id,
        buffSpellId: TALENTS.EVOCATION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS.EVOCATION_TALENT),
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.PRESENCE_OF_MIND_TALENT.id,
        buffSpellId: TALENTS.PRESENCE_OF_MIND_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS.PRESENCE_OF_MIND_TALENT),
        gcd: null,
        cooldown: 45,
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.6,
        },
      },
      {
        spell: TALENTS.RADIANT_SPARK_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS.RADIANT_SPARK_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      ...super.spellbook(),
    ];
  }
}

export default Abilities;

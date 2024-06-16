import CoreAbilities from 'analysis/retail/mage/shared/Abilities';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // Rotational spells
      {
        spell: SPELLS.FIREBALL.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        damageSpellIds: [SPELLS.FIREBALL.id],
      },
      {
        spell: TALENTS.METEOR_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: combatant.hasTalent(TALENTS.DEEP_IMPACT_TALENT) ? 30 : 45,
        enabled: combatant.hasTalent(TALENTS.METEOR_TALENT),
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: SPELLS.FLAMESTRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.PYROBLAST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.PYROBLAST_TALENT),
        damageSpellIds: [TALENTS.PYROBLAST_TALENT.id],
      },
      {
        spell: SPELLS.SCORCH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.PHOENIX_FLAMES_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown:
          combatant.hasTalent(TALENTS.FIERY_RUSH_TALENT) &&
          combatant.hasBuff(TALENTS.COMBUSTION_TALENT.id)
            ? 25 / 1.5
            : 25,
        charges: 2 + combatant.getTalentRank(TALENTS.CALL_OF_THE_SUN_KING_TALENT),
        enabled: combatant.hasTalent(TALENTS.PHOENIX_FLAMES_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.FIRE_BLAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: combatant.hasTalent(TALENTS.FIRE_BLAST_TALENT) ? null : { base: 1500 },
        enabled: combatant.hasTalent(TALENTS.FIRE_BLAST_TALENT),
        cooldown: (haste: any) =>
          combatant.hasTalent(TALENTS.FIERY_RUSH_TALENT) &&
          combatant.hasBuff(TALENTS.COMBUSTION_TALENT.id)
            ? 10 / 1.5 / (1 + haste)
            : 10 / (1 + haste),
        charges: combatant.hasTalent(TALENTS.FLAME_ON_TALENT) ? 3 : 1,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },

      // Cooldowns
      {
        spell: TALENTS.COMBUSTION_TALENT.id,
        buffSpellId: TALENTS.COMBUSTION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 120,
        enabled: combatant.hasTalent(TALENTS.COMBUSTION_TALENT),
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

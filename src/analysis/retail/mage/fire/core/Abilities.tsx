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
        spell: SPELLS.FROSTBOLT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        damageSpellIds: [SPELLS.FROSTBOLT_DAMAGE.id],
      },
      {
        spell: SPELLS.ARCANE_EXPLOSION.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        damageSpellIds: [SPELLS.ARCANE_EXPLOSION.id],
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
        cooldown: (haste: any) =>
          combatant.hasTalent(TALENTS.FIERY_RUSH_TALENT) &&
          combatant.hasBuff(TALENTS.COMBUSTION_TALENT.id)
            ? (combatant.hasTalent(TALENTS.FLAME_ON_TALENT) ? 10 : 12) / 1.5 / (1 + haste)
            : (combatant.hasTalent(TALENTS.FLAME_ON_TALENT) ? 10 : 12) / (1 + haste),
        charges: 1 + combatant.getTalentRank(TALENTS.FLAME_ON_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.FLAMESTRIKE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.FLAMESTRIKE_TALENT),
      },
      {
        spell: TALENTS.LIVING_BOMB_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        cooldown: (haste: any) => 12 / (1 + haste),
        enabled: combatant.hasTalent(TALENTS.LIVING_BOMB_TALENT.id),
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

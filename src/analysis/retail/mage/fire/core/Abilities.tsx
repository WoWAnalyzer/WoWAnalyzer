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
        cooldown: combatant.hasTalent(TALENTS.BLAST_ZONE_TALENT) ? 30 : 45,
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
        spell: SPELLS.FIRE_BLAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: combatant.hasTalent(TALENTS.FIRE_BLAST_TALENT) ? null : { base: 1500 },
        enabled:
          combatant.hasTalent(TALENTS.FIRE_BLAST_TALENT) &&
          !combatant.hasTalent(TALENTS.FLAME_ON_TALENT),
        cooldown: (haste) =>
          14 /
          (combatant.hasTalent(TALENTS.FIERY_RUSH_TALENT) &&
          combatant.hasBuff(TALENTS.COMBUSTION_TALENT)
            ? 1.5
            : 1) /
          (1 + haste),
        charges: 1 + combatant.getTalentRank(TALENTS.FERVENT_FLICKERING_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.FIRE_BLAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: combatant.hasTalent(TALENTS.FIRE_BLAST_TALENT) ? null : { base: 1500 },
        enabled:
          combatant.hasTalent(TALENTS.FIRE_BLAST_TALENT) &&
          combatant.hasTalent(TALENTS.FLAME_ON_TALENT),
        cooldown: (haste) =>
          12 /
          (combatant.hasTalent(TALENTS.FIERY_RUSH_TALENT) &&
          combatant.hasBuff(TALENTS.COMBUSTION_TALENT)
            ? 1.5
            : 1) /
          (1 + haste),
        charges:
          1 +
          combatant.getTalentRank(TALENTS.FERVENT_FLICKERING_TALENT) +
          combatant.getTalentRank(TALENTS.FLAME_ON_TALENT),
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
        cooldown: combatant.hasTalent(TALENTS.KINDLING_TALENT) ? 60 : 120,
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

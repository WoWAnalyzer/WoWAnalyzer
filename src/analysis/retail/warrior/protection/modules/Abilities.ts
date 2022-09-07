import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.DEVASTATE.id,
        enabled: !combatant.hasTalent(SPELLS.DEVASTATOR_TALENT.id),
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.ROTATIONAL,
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.WHIRLWIND.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHATTERING_THROW.id,
        gcd: {
          base: 1500,
        },
        cooldown: 180,
        category: SPELL_CATEGORY.OTHERS,
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.EXECUTE.id,
        enabled: !combatant.hasCovenant(COVENANTS.VENTHYR.id),
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.ROTATIONAL,
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.REVENGE.id,
        gcd: {
          base: 1500,
        },
        buffSpellId: SPELLS.REVENGE_FREE_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.SHIELD_SLAM.id,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.ROTATIONAL,
        buffSpellId: SPELLS.PUNISH_DEBUFF.id,
        cooldown: (haste) => 9 / (1 + haste),
        timelineSortIndex: 1,
      },
      {
        spell: SPELLS.THUNDER_CLAP.id,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.ROTATIONAL, // 6 / (1 + haste)
        cooldown: (haste) => {
          if (
            combatant.hasTalent(SPELLS.UNSTOPPABLE_FORCE_TALENT.id) &&
            combatant.hasBuff(SPELLS.AVATAR_TALENT.id)
          ) {
            return 6 / 2 / (1 + haste);
          }
          return 6 / (1 + haste);
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: 'Casting Thunder Clap regularly is very important for performing well.',
        },
        timelineSortIndex: 2,
      },
      {
        spell: SPELLS.IGNORE_PAIN.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        buffSpellId: SPELLS.IGNORE_PAIN.id,
        timelineSortIndex: 4,
      },
      {
        spell: SPELLS.SHIELD_BLOCK.id,
        buffSpellId: SPELLS.SHIELD_BLOCK_BUFF.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: (haste) => 16 / (1 + haste),
        charges: 2,
        timelineSortIndex: 5,
      },
      {
        spell: SPELLS.DEMORALIZING_SHOUT.id,
        buffSpellId: SPELLS.DEMORALIZING_SHOUT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: {
          base: 1500,
        },
        cooldown: 45,
        timelineSortIndex: 8,
      },
      {
        spell: SPELLS.LAST_STAND.id,
        buffSpellId: SPELLS.LAST_STAND.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(SPELLS.BOLSTER_TALENT.id) ? 180 - 60 : 180,
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.SHIELD_WALL.id,
        buffSpellId: SPELLS.SHIELD_WALL.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 240,
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.SPELL_REFLECTION.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 25,
      },
      {
        spell: SPELLS.HEROIC_LEAP.id,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.BOUNDING_STRIDE_TALENT.id) ? 45 - 15 : 45,
      },
      {
        spell: SPELLS.HEROIC_THROW.id,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.UTILITY,
      },
      {
        spell: SPELLS.TAUNT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
      },
      {
        spell: SPELLS.BERSERKER_RAGE.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        timelineSortIndex: 8,
      },
      {
        spell: SPELLS.PUMMEL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
      },
      {
        spell: SPELLS.VICTORY_RUSH.id,
        enabled: !combatant.hasTalent(SPELLS.IMPENDING_VICTORY_TALENT.id),
        category: SPELL_CATEGORY.OTHERS,
      },
      {
        spell: SPELLS.STORM_BOLT_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.STORM_BOLT_TALENT.id),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 30,
      },
      {
        spell: SPELLS.AVATAR_TALENT.id,
        buffSpellId: SPELLS.AVATAR_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 90,
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.IMPENDING_VICTORY_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.IMPENDING_VICTORY_TALENT.id),
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        cooldown: 25,
      },
      {
        spell: SPELLS.RAVAGER_TALENT_PROTECTION.id,
        enabled: combatant.hasTalent(SPELLS.RAVAGER_TALENT_PROTECTION.id),
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 45,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.DRAGON_ROAR_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.DRAGON_ROAR_TALENT.id),
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 35,
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.RALLYING_CRY.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 180,
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.CHARGE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 20 - (combatant.hasTalent(SPELLS.DOUBLE_TIME_TALENT.id) ? 3 : 0),
        charges: 1 + (combatant.hasTalent(SPELLS.DOUBLE_TIME_TALENT.id) ? 1 : 0),
        timelineSortIndex: 9,
      },
      {
        spell: [SPELLS.INTERVENE_CAST.id, SPELLS.INTERVENE_BUFF.id, SPELLS.INTERVENE_CHARGE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 30,
        timelineSortIndex: 9,
      },

      // covenant magic
      {
        spell: SPELLS.CONQUERORS_BANNER.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 120,
        timelineSortIndex: 9,
        enabled: combatant.hasCovenant(COVENANTS.NECROLORD.id),
      },
    ];
  }
}

export default Abilities;

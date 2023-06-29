import SPELLS from 'common/SPELLS';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import TALENTS from 'common/TALENTS/warrior';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.DEVASTATE.id,
        enabled: !combatant.hasTalent(TALENTS.DEVASTATOR_TALENT),
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
        enabled: !false,
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
        cooldown: (haste) => {
          if (combatant.hasTalent(TALENTS.HONED_REFLEXES_PROTECTION_TALENT)) {
            return 8 / (1 + haste);
          }
          return 9 / (1 + haste);
        },
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
            combatant.hasTalent(TALENTS.UNSTOPPABLE_FORCE_TALENT) &&
            combatant.hasBuff(TALENTS.AVATAR_PROTECTION_TALENT.id)
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
        cooldown: combatant.hasTalent(TALENTS.BOLSTER_TALENT) ? 180 - 60 : 180,
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
        cooldown: combatant.hasTalent(TALENTS.BOUNDING_STRIDE_TALENT) ? 45 - 15 : 45,
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
        enabled: !combatant.hasTalent(TALENTS.IMPENDING_VICTORY_TALENT),
        category: SPELL_CATEGORY.OTHERS,
      },
      {
        spell: TALENTS.STORM_BOLT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.STORM_BOLT_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 30,
      },
      {
        spell: TALENTS.AVATAR_PROTECTION_TALENT.id,
        buffSpellId: TALENTS.AVATAR_PROTECTION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 90,
        timelineSortIndex: 9,
      },
      {
        spell: TALENTS.IMPENDING_VICTORY_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.IMPENDING_VICTORY_TALENT),
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        cooldown: 25,
      },
      {
        spell: TALENTS.RAVAGER_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.RAVAGER_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 90,
        charges: 1 + (combatant.hasTalent(TALENTS.STORM_OF_STEEL_TALENT) ? 1 : 0),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        timelineSortIndex: 9,
      },
      {
        spell: TALENTS.THUNDEROUS_ROAR_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.THUNDEROUS_ROAR_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 90 - (combatant.hasTalent(TALENTS.UPROAR_TALENT) ? 30 : 0),
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
        cooldown: 20 - (combatant.hasTalent(TALENTS.DOUBLE_TIME_TALENT) ? 3 : 0),
        charges: 1 + (combatant.hasTalent(TALENTS.DOUBLE_TIME_TALENT) ? 1 : 0),
        timelineSortIndex: 9,
      },
      {
        spell: [TALENTS.INTERVENE_TALENT.id, SPELLS.INTERVENE_BUFF.id, SPELLS.INTERVENE_CHARGE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 30,
        timelineSortIndex: 9,
      },
      {
        spell: TALENTS.SHIELD_CHARGE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SHIELD_CHARGE_TALENT),
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
        spell: TALENTS.SHOCKWAVE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SHOCKWAVE_TALENT),
        category: combatant.hasTalent(TALENTS.SONIC_BOOM_TALENT)
          ? SPELL_CATEGORY.COOLDOWNS
          : SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 40 - (combatant.hasTalent(TALENTS.RUMBLING_EARTH_TALENT) ? 15 : 0),
        timelineSortIndex: 9,
      },
      {
        spell: TALENTS.SPEAR_OF_BASTION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SPEAR_OF_BASTION_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        timelineSortIndex: 9,
      },
    ];
  }
}

export default Abilities;

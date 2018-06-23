import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.DEVASTATE,
        enabled: !combatant.hasTalent(SPELLS.DEVASTATOR_TALENT.id),
        gcd: true,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.REVENGE,
        gcd: true,
        buffSpellId: SPELLS.REVENGE_FREE_CAST.id,
        cooldown: haste => 3 / (1 + haste),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.SHIELD_SLAM,
        gcd: true,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        buffSpellId: SPELLS.PUNISH_DEBUFF.id,
        cooldown: haste => 9 / (1 + haste),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: .9,
          extraSuggestion: 'Casting Shield Slam regularly is very important for performing well.',
        },
        timelineSortIndex: 1,
      },
      {
        spell: SPELLS.THUNDER_CLAP,
        gcd: true,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL, // 6 / (1 + haste)
        cooldown: (haste, selectedCombatant) => {
          if (selectedCombatant.hasTalent(SPELLS.UNSTOPPABLE_FORCE_TALENT.id) && selectedCombatant.hasBuff(SPELLS.AVATAR_TALENT.id)) {
            return 6 / 2 / (1 + haste);
          }
          return 6 / (1 + haste);
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: .9,
          extraSuggestion: 'Casting Thunder Clap regularly is very important for performing well.',
        },
        timelineSortIndex: 2,
      },
      {
        spell: SPELLS.IGNORE_PAIN,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        buffSpellId: SPELLS.IGNORE_PAIN.id,
        timelineSortIndex: 4,
      },
      {
        spell: SPELLS.NELTHARIONS_FURY,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
        timelineSortIndex: 6,
      },
      {
        spell: SPELLS.SHIELD_BLOCK,
        buffSpellId: SPELLS.SHIELD_BLOCK_BUFF.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: haste => 13 / (1 + haste),
        charges: 2,
        timelineSortIndex: 5,
      },
      {
        spell: SPELLS.DEMORALIZING_SHOUT,
        buffSpellId: SPELLS.DEMORALIZING_SHOUT.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        castEfficiency: {
          suggestion: combatant.hasTalent(SPELLS.BOOMING_VOICE_TALENT.id),
          recommendedEfficiency: combatant.hasTalent(SPELLS.ANGER_MANAGEMENT_TALENT.id) ? .95 : .80,
          extraSuggestion: 'Cast Demoralizing Shout more liberally to maximize it\'s DPS boost unless you need it so survive a specific mechanic.',
        },
        gcd: true,
        cooldown: 45,
        timelineSortIndex: 8,
      },
      {
        spell: SPELLS.LAST_STAND,
        buffSpellId: SPELLS.LAST_STAND.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: combatant.hasTalent(SPELLS.BOLSTER_TALENT.id) ? 180 - 60 : 180,
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.SHIELD_WALL,
        buffSpellId: SPELLS.SHIELD_WALL.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 240,
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.SPELL_REFLECTION,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 25,
      },
      {
        spell: SPELLS.HEROIC_LEAP,
        gcd: true,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.BOUNDING_STRIDE_TALENT.id) ? 45 - 15 : 45,
      },
      {
        spell: SPELLS.HEROIC_THROW,
        gcd: true,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      {
        spell: SPELLS.INTERCEPT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        charges: 2,
      },
      {
        spell: SPELLS.TAUNT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
      },
      {
        spell: SPELLS.BERSERKER_RAGE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
        castEfficiency: {
          suggestion: combatant.hasTalent(SPELLS.PROTECTION_WARRIOR_T20_2P_BONUS.id),
        },
        timelineSortIndex: 8,
      },
      {
        spell: SPELLS.PUMMEL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
      },
      {
        spell: SPELLS.VICTORY_RUSH,
        enabled: !combatant.hasTalent(SPELLS.IMPENDING_VICTORY_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },
      {
        spell: SPELLS.SHOCKWAVE_TALENT,
        enabled: combatant.hasTalent(SPELLS.SHOCKWAVE_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: true,
      },
      {
        spell: SPELLS.STORM_BOLT_TALENT,
        enabled: combatant.hasTalent(SPELLS.STORM_BOLT_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: true,
        cooldown: 30,
      },
      {
        spell: SPELLS.AVATAR_TALENT,
        buffSpellId: SPELLS.AVATAR_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: .9,
        },
        gcd: true,
        cooldown: 90,
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.IMPENDING_VICTORY_TALENT,
        enabled: combatant.hasTalent(SPELLS.IMPENDING_VICTORY_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: true,
        cooldown: 30,
      },
      {
        spell: SPELLS.RAVAGER_TALENT_PROTECTION,
        enabled: combatant.hasTalent(SPELLS.RAVAGER_TALENT_PROTECTION.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: true,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: .9,
        },
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.DRAGON_ROAR_TALENT,
        enabled: combatant.hasTalent(SPELLS.DRAGON_ROAR_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: true,
        cooldown: 35,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: .9,
        },
        timelineSortIndex: 9,
      },
    ];
  }
}

export default Abilities;

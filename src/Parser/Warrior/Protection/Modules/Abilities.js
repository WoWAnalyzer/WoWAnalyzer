import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.DEVASTATE,
        isOnGCD: true,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.REVENGE,
        isOnGCD: true,
        buffSpellId: SPELLS.REVENGE_FREE_CAST.id,
        cooldown: haste => 3 / (1 + haste),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.SHIELD_SLAM,
        isOnGCD: true,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
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
        isOnGCD: true,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 6 / (1 + haste),
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
        cooldown: 90,
        timelineSortIndex: 8,
      },
      {
        spell: SPELLS.LAST_STAND,
        buffSpellId: SPELLS.LAST_STAND.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 180,
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
        isOnGCD: true,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
      },
      {
        spell: SPELLS.HEROIC_THROW,
        isOnGCD: true,
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
        spell: SPELLS.BATTLE_CRY,
        buffSpellId: SPELLS.BATTLE_CRY.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: .9,
        },
        timelineSortIndex: 7,
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
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },
      {
        spell: SPELLS.SHOCKWAVE_TALENT,
        enabled: combatant.hasTalent(SPELLS.SHOCKWAVE_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.STORM_BOLT_TALENT,
        enabled: combatant.hasTalent(SPELLS.STORM_BOLT_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        cooldown: 30,
      },
      {
        spell: SPELLS.AVATAR_TALENT,
        enabled: combatant.hasTalent(SPELLS.AVATAR_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        isOnGCD: true,
        cooldown: 90,
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.IMPENDING_VICTORY_TALENT,
        enabled: combatant.hasTalent(SPELLS.IMPENDING_VICTORY_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isOnGCD: true,
      },
      {
        spell: SPELLS.RAVAGER_TALENT_PROTECTION,
        enabled: combatant.hasTalent(SPELLS.RAVAGER_TALENT_PROTECTION.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        isOnGCD: true,
        cooldown: 60,
        timelineSortIndex: 9,
      },
    ];
  }
}

export default Abilities;

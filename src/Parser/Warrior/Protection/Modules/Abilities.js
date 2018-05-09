import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.DEVASTATE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.REVENGE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.SHIELD_SLAM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 9 / (1 + haste),
        castEfficiency: {
          suggestion: true,
          extraSuggestion: 'Casting Shield Slam regularly is very important for performing well.',
        },
      },
      {
        spell: SPELLS.THUNDER_CLAP,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 6 / (1 + haste),
        castEfficiency: {
          suggestion: true,
          extraSuggestion: 'Casting Thunder Clap regularly is very important for performing well.',
        },
      },
      {
        spell: SPELLS.IGNORE_PAIN,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      },
      {
        spell: SPELLS.NELTHARIONS_FURY,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
      },
      {
        spell: SPELLS.SHIELD_BLOCK,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: haste => 13 / (1 + haste),
      },
      {
        spell: SPELLS.DEMORALIZING_SHOUT,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 90,
      },
      {
        spell: SPELLS.LAST_STAND,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 180,
      },
      {
        spell: SPELLS.SHIELD_WALL,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 240,
      },
      {
        spell: SPELLS.SPELL_REFLECTION,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 25,
      },
      {
        spell: SPELLS.HEROIC_LEAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
      },
      {
        spell: SPELLS.HEROIC_THROW,
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
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.BERSERKER_RAGE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
        castEfficiency: {
          suggestion: combatant.hasTalent(SPELLS.PROTECTION_WARRIOR_T20_2P_BONUS.id),
        },
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
    ];
  }
}

export default Abilities;

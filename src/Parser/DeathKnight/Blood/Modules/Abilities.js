import SPELLS from 'common/SPELLS';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() { // TODO: Migrate
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.ICEBOUND_FORTITUDE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.50,
          extraSuggestion: 'Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake or to take the edge of big attacks.',
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      {
        spell: SPELLS.VAMPIRIC_BLOOD,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.50,
          extraSuggestion: 'Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake or to take the edge of big attacks.',
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },

      {
        spell: SPELLS.BLOOD_MIRROR_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.BLOOD_MIRROR_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.75,
          extraSuggestion: 'Mostly a DPS CD. Use it to reflect large damage back to the boss. It can be used defensively to reduce 20% damage taken for its duration.',
        },
      },

      {
        spell: SPELLS.BLOOD_BOIL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 7.5 / (1 + haste),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          extraSuggestion: 'Should be casting it so you have at least one recharging.',
        },
      },
      {
        spell: SPELLS.CONSUMPTION,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 45,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: 'Should be casting this on CD for the dps unless your saving the leach for something or saving it for a pack of adds.',
        },
      },

      {
        spell: SPELLS.DANCING_RUNE_WEAPON,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: 'Should be used as an opener and used on CD for the dps boost.',
        },
      },

      {
        spell: SPELLS.BLOODDRINKER_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.BLOODDRINKER_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: 'Mostly used as a dps CD. Should be almost casted on CD. Good to use when your running to the boss or cant melee them.',
        },
      },

      {
        spell: SPELLS.ARCANE_TORRENT_MANA,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        isUndetectable: true,
        castEfficiency: {
          suggestion: true,
        },
      },
    ];
  }
}

export default Abilities;

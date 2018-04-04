import SPELLS from 'common/SPELLS';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.ICEBOUND_FORTITUDE,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.50,
          extraSuggestion: 'Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake or to take the edge of big attacks.',
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.VAMPIRIC_BLOOD,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.50,
          extraSuggestion: 'Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake or to take the edge of big attacks.',
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineSortIndex: 10,
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
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.BLOOD_BOIL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 7.5 / (1 + haste),
        isOnGCD: true,
        charges: 2,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          extraSuggestion: 'Should be casting it so you have at least one recharging.',
        },
        timelineSortIndex: 4,
      },
      {
        spell: SPELLS.CONSUMPTION,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 45,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: 'Should be casting this on CD for the dps unless your saving the leach for something or saving it for a pack of adds.',
        },
        timelineSortIndex: 5,
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
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.BLOODDRINKER_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.BLOODDRINKER_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: 'Mostly used as a dps CD. Should be almost casted on CD. Good to use when your running to the boss or cant melee them.',
        },
        timelineSortIndex: 6,
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
      {
        spell: SPELLS.DEATH_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        timelineSortIndex: 1,
      },
      {
        spell: SPELLS.DEATHS_CARESS,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        timelineSortIndex: 7,
      },
      {
        spell: SPELLS.DEATH_AND_DECAY,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.RAPID_DECOMPOSITION_TALENT.id),
        cooldown: 15,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.80, //reduced because of proc resets
        },
        timelineSortIndex: 5,
      },
      //do not use cast efficiency for DnD without Rapid Decomposition.
      {
        spell: SPELLS.DEATH_AND_DECAY,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        enabled: !combatant.hasTalent(SPELLS.RAPID_DECOMPOSITION_TALENT.id),
        cooldown: 15,
        timelineSortIndex: 5,
      },
      {
        spell: SPELLS.HEART_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.MARROWREND,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        timelineSortIndex: 2,
      },
      {
        spell: SPELLS.ANTI_MAGIC_SHELL,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.50,
          extraSuggestion: 'Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake or to take the edge of big attacks.',
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.MIND_FREEZE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
      },
      {
        spell: SPELLS.DARK_COMMAND,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
      },
      {
        spell: SPELLS.DEATH_GRIP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        timelineSortIndex: 14,
      },
      {
        spell: SPELLS.WRAITH_WALK,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        cooldown: 45,
        timelineSortIndex: 14,
      },
      {
        spell: SPELLS.GOREFIENDS_GRASP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        cooldown: this.combatants.selected.hasTalent(SPELLS.TIGHTENING_GRASP_TALENT.id) ? 90 : 120,
        timelineSortIndex: 11,
      },
      {
        spell: SPELLS.RAISE_ALLY,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.ASPHYXIATE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        isOnGCD: true,
      },
      {
        spell: SPELLS.CONTROL_UNDEAD,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isOnGCD: true,
      },
      {
        spell: SPELLS.BLOOD_TAP_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.BLOOD_TAP_TALENT.id),
        cooldown: 60,
        charges: 2,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
        timelineSortIndex: 8,
      },
      {
        spell: SPELLS.MARK_OF_BLOOD,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        enabled: combatant.hasTalent(SPELLS.MARK_OF_BLOOD.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.50,
          extraSuggestion: 'Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake or to take the edge of big attacks.',
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.TOMBSTONE_TALENT,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        enabled: combatant.hasTalent(SPELLS.TOMBSTONE_TALENT.id),
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.50,
          extraSuggestion: 'Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake or to take the edge of big attacks.',
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.RUNE_TAP_TALENT,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        enabled: combatant.hasTalent(SPELLS.RUNE_TAP_TALENT.id),
        cooldown: 25,
        charges: 2,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.50,
          extraSuggestion: 'Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake or to take the edge of big attacks.',
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.BONESTORM_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        enabled: combatant.hasTalent(SPELLS.BONESTORM_TALENT.id),
        cooldown: 60,
        isOnGCD: true,
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.RUNE_1,
        category: Abilities.SPELL_CATEGORIES.HIDDEN,
        cooldown: (haste, combatantCurrent) => {
          const multiplier = combatantCurrent.hasBuff(SPELLS.RUNE_MASTER.id) ? 0.4 : 0;
          return 10 / (1 + haste) / (1 + multiplier);
        },
        charges: 2,
      },
      {
        spell: SPELLS.RUNE_2,
        category: Abilities.SPELL_CATEGORIES.HIDDEN,
        cooldown: (haste, combatantCurrent) => {
          const multiplier = combatantCurrent.hasBuff(SPELLS.RUNE_MASTER.id) ? 0.4 : 0;
          return 10 / (1 + haste) / (1 + multiplier);
        },
        charges: 2,
      },
      {
        spell: SPELLS.RUNE_3,
        category: Abilities.SPELL_CATEGORIES.HIDDEN,
        cooldown: (haste, combatantCurrent) => {
          const multiplier = combatantCurrent.hasBuff(SPELLS.RUNE_MASTER.id) ? 0.4 : 0;
          return 10 / (1 + haste) / (1 + multiplier);
        },
        charges: 2,
      },
    ];
  }
}

export default Abilities;

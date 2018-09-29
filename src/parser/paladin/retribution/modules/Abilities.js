import SPELLS from 'common/SPELLS';

import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';

import CoreAbilities from 'parser/core/modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.WAKE_OF_ASHES_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.WAKE_OF_ASHES_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          extraSuggestion: 'It has a high damage per execute time and generates a lot of holy power. It is better to waste 1-2 holy power than to hold the ability. Only hold the ability if adds are coming out in less than 3 seconds',
        },
      },
      {
        spell: SPELLS.CRUSADE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.CRUSADE_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          importance: ISSUE_IMPORTANCE.MAJOR,
          extraSuggestion: 'This is our only cooldown and where most of our damage comes from. You really want to not lose a cast of this over a fight.',
        },
      },
      {
        spell: SPELLS.AVENGING_WRATH,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: !combatant.hasTalent(SPELLS.CRUSADE_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.CRUSADER_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        charges: 2,
        cooldown: haste => 6 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.JUDGMENT_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 12 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.BLADE_OF_JUSTICE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 10.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.75,
        },
      },
      {
        spell: SPELLS.HAMMER_OF_WRATH_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.HAMMER_OF_WRATH_TALENT.id),
        cooldown: haste => 7.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TEMPLARS_VERDICT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DIVINE_STORM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.INQUISITION_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.INQUISITION_TALENT.id),
      },
      {
        spell: SPELLS.EXECUTION_SENTENCE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 20 / (1 + haste),
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.EXECUTION_SENTENCE_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.CONSECRATION_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.CONSECRATION_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      //Utility
      {
        spell: SPELLS.SHIELD_OF_VENGEANCE,
        buffSpellId: SPELLS.SHIELD_OF_VENGEANCE.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: combatant.hasTalent(SPELLS.UNBREAKABLE_SPIRIT_TALENT.id) ? 84 : 120,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      {
        spell: SPELLS.JUSTICARS_VENGEANCE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.JUSTICARS_VENGEANCE_TALENT.id),
      },
      {
        spell: SPELLS.EYE_FOR_AN_EYE_TALENT,
        buffSpellId: SPELLS.EYE_FOR_AN_EYE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.EYE_FOR_AN_EYE_TALENT.id),
      },
      {
        spell: SPELLS.WORD_OF_GLORY_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        charges: 2,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.WORD_OF_GLORY_TALENT.id),
      },
      {
        spell: SPELLS.BLINDING_LIGHT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.BLINDING_LIGHT_TALENT.id),
      },
      {
        spell: SPELLS.REPENTANCE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.REPENTANCE_TALENT.id),
      },
      {
        spell: SPELLS.DIVINE_STEED,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        charges: combatant.hasTalent(SPELLS.CAVALIER_TALENT.id) ? 2 : 1,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LAY_ON_HANDS,
        isDefensive: true,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.UNBREAKABLE_SPIRIT_TALENT.id) ? 420 : 600,
        castEfficiency: {
          recommendedEfficiency: 0.1,
        },
      },
      {
        spell: SPELLS.BLESSING_OF_FREEDOM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 25,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BLESSING_OF_PROTECTION,
        buffSpellId: SPELLS.BLESSING_OF_PROTECTION.id,
        isDefensive: true,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 300,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HAMMER_OF_JUSTICE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HAND_OF_RECKONING,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
      },
      {
        spell: SPELLS.DIVINE_SHIELD,
        buffSpellId: SPELLS.DIVINE_SHIELD.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: combatant.hasTalent(SPELLS.UNBREAKABLE_SPIRIT_TALENT.id) ? 210 : 300,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FLASH_OF_LIGHT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;

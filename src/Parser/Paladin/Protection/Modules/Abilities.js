//import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

//import SpellLink from 'common/SpellLink';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.CONSECRATION_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 9 / (1 + haste),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.BLESSED_HAMMER_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 4.5 / (1 + haste),
        isOnGCD: true,
        charges: 3,
        enabled: combatant.hasTalent(SPELLS.BLESSED_HAMMER_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.AVENGERS_SHIELD,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 15 / (1 + haste),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      // Probably useless to try to count the number of casts
      //Note by yajinni: Since this is thier main source of damage mitigation, without it they get hit like by a truck.
      //And a main source of damage, it should be tracked somewhat. Keeping it at 80% for now.
      {
        spell: SPELLS.SHIELD_OF_THE_RIGHTEOUS,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 16 / (1 + haste),
        charges: 3,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      { // T15: Holy Shield
        spell: SPELLS.HAMMER_OF_THE_RIGHTEOUS,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 4.5 / (1 + haste),
        charges: 2,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.HOLY_SHIELD_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      { // T15: Consecrated Hammer talent (Hammer of the Righteous has no cooldown)
        spell: SPELLS.HAMMER_OF_THE_RIGHTEOUS,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.CONSECRATED_HAMMER_TALENT.id),
      },
      {
        spell: SPELLS.JUDGMENT_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 6 / (1 + haste),
        charges: combatant.hasTalent(SPELLS.CRUSADERS_JUDGMENT_TALENT.id) ? 2 : 1,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.LIGHT_OF_THE_PROTECTOR,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 15 / (1 + haste) * (combatant.hasHead(ITEMS.SARUANS_RESOLVE.id) ? 0.9 : 1),
        charges: 1 + (combatant.hasHead(ITEMS.SARUANS_RESOLVE.id) ? 1 : 0),
        enabled: !combatant.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      {
        spell: SPELLS.HAND_OF_THE_PROTECTOR_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 10 / (1 + haste) * (combatant.hasHead(ITEMS.SARUANS_RESOLVE.id) ? 0.9 : 1),
        charges: 1 + (combatant.hasHead(ITEMS.SARUANS_RESOLVE.id) ? 1 : 0),
        enabled: combatant.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      //COOLDOWNS
      {
        spell: SPELLS.EYE_OF_TYR,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (haste, combatant) => 60 * (combatant.hasShoulder(ITEMS.PILLARS_OF_INMOST_LIGHT.id) ? 0.75 : 1),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },
      {
        spell: SPELLS.ARDENT_DEFENDER,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120 - (combatant.traitsBySpellId[SPELLS.UNFLINCHING_DEFENSE.id] || 0) * 10,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.GUARDIAN_OF_ANCIENT_KINGS,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 300,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.SERAPHIM_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.SERAPHIM_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.AVENGING_WRATH,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        // castEfficiency: {
        //   suggestion: true,
        //   recommendedEfficiency: 0.85,
        // },
      },
      {
        spell: SPELLS.LAY_ON_HANDS,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 600,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.1,
        },
      },
      {
        spell: SPELLS.FLASH_OF_LIGHT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isOnGCD: true,
      },
      {
        spell: SPELLS.DIVINE_STEED,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45 * (combatant.hasTalent(SPELLS.KNIGHT_TEMPLAR_TALENT.id) ? 0.5 : 1),
        charges: combatant.hasTalent(SPELLS.CAVALIER_TALENT.id) ? 2 : 1,
        isOnGCD: true,
      },
      {
        spell: SPELLS.BLESSING_OF_FREEDOM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 25,
        isOnGCD: true,
      },
      {
        spell: SPELLS.BLESSING_OF_PROTECTION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 5 * 60,
        isOnGCD: true,
        enabled: !combatant.hasTalent(SPELLS.BLESSING_OF_SPELLWARDING_TALENT.id),
      },
      {
        spell: SPELLS.BLESSING_OF_SPELLWARDING_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.BLESSING_OF_SPELLWARDING_TALENT.id),
      },
      {
        spell: SPELLS.BLESSING_OF_SACRIFICE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 2.5 * 60 - (combatant.traitsBySpellId[SPELLS.SACRIFICE_OF_THE_JUST.id] || 0) * 60,
        // castEfficiency: {
        //   suggestion: true,
        //   recommendedEfficiency: 0.85,
        // },
      },
      {
        spell: SPELLS.AEGIS_OF_LIGHT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 180,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.AEGIS_OF_LIGHT_TALENT.id),
      },
      {
        spell: SPELLS.CLEANSE_TOXINS,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
        isOnGCD: true,
      },
      {
        spell: SPELLS.HAMMER_OF_JUSTICE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        isOnGCD: true,
      },
      {
        spell: SPELLS.HAND_OF_RECKONING,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
      },
      {
        spell: SPELLS.REBUKE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
      },
      {
        spell: SPELLS.BLINDING_LIGHT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.BLINDING_LIGHT_TALENT.id),
      },
      {
        spell: SPELLS.REPENTANCE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.REPENTANCE_TALENT.id),
      },
      {
        spell: SPELLS.BASTION_OF_LIGHT_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.BASTION_OF_LIGHT_TALENT.id),
      },
    ];
  }
}

export default Abilities;

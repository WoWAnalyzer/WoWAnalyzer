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
        spell: SPELLS.HAMMER_OF_THE_RIGHTEOUS,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        charges: 2,
        cooldown: haste => 4.5 / (1 + haste),
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.HOLY_SHIELD_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.HAMMER_OF_THE_RIGHTEOUS,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        charges: 2,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.CONSECRATED_HAMMER_TALENT.id),
      },
      {
        spell: SPELLS.BLESSED_HAMMER_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 4.5 / (1 + haste),
        charges: 3,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.BLESSED_HAMMER_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.JUDGMENT_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 12 / (1+ haste),
        charges: combatant.hasTalent(SPELLS.CRUSADERS_JUDGMENT_TALENT.id) ? 2 : 1,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
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
      {
        spell: SPELLS.HAND_OF_THE_PROTECTOR_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: combatant.hasHead(ITEMS.SARUANS_RESOLVE.id) ? 9 : 10,
        charges: combatant.hasHead(ITEMS.SARUANS_RESOLVE.id) ? 2 : 1,
        enabled: combatant.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      {
        spell: SPELLS.LIGHT_OF_THE_PROTECTOR,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: combatant.hasHead(ITEMS.SARUANS_RESOLVE.id) ? 13.5 : 15,
        charges: combatant.hasHead(ITEMS.SARUANS_RESOLVE.id) ? 2 : 1,
        enabled: !combatant.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
          importance: ISSUE_IMPORTANCE.MINOR,
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
        },
      },
      //COOLDOWNS
      {
        spell: SPELLS.EYE_OF_TYR,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (haste, combatant) => (combatant.hasShoulder(ITEMS.PILLARS_OF_INMOST_LIGHT.id) ? 45 : 60),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },
      {
        spell: SPELLS.ARDENT_DEFENDER,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (_, combatant) => 120 - (combatant.traitsBySpellId[SPELLS.UNFLINCHING_DEFENSE.id] || 0) * 10,
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
        spell: SPELLS.AEGIS_OF_LIGHT_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.AEGIS_OF_LIGHT_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.SERAPHIM_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
        enabled:combatant.hasTalent(SPELLS.SERAPHIM_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.DIVINE_SHIELD,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 300,
        isOnGCD: true,
      },
      {
        spell: SPELLS.BLESSING_OF_PROTECTION,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 300,
        isOnGCD: true,
        enabled: !combatant.hasTalent(SPELLS.BLESSING_OF_SPELLWARDING_TALENT.id),
      },
      {
        spell: SPELLS.BLESSING_OF_SPELLWARDING_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        isOnGCD: true,
      },
      {
        spell: SPELLS.BLESSING_OF_SACRIFICE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (_, combatant) => 150 - (combatant.traitsBySpellId[SPELLS.SACRIFICE_OF_THE_JUST.id] || 0) * 60,
      },
      {
        spell: SPELLS.AVENGING_WRATH_RET,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
      },
      //Utility
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
        spell: SPELLS.DIVINE_STEED,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        charges: combatant.hasTalent(SPELLS.CAVALIER_TALENT.id) ? 2 : 1,
        cooldown: combatant.hasTalent(SPELLS.KNIGHT_TEMPLAR_TALENT.id) ? 22.5 : 45,
        isOnGCD: true,
      },
      {
        spell: SPELLS.HAMMER_OF_JUSTICE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
      },
      {
        spell: SPELLS.LAY_ON_HANDS,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 600,
        castEfficiency: {
          recommendedEfficiency: 0.1,
        },
      },
      {
        spell: SPELLS.BLESSING_OF_FREEDOM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 25,
        isOnGCD: true,
      },
      {
        spell: SPELLS.HAND_OF_RECKONING,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
      },
      {
        spell: SPELLS.FLASH_OF_LIGHT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
    ];
  }
}

export default Abilities;

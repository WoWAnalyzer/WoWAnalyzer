import SPELLS from 'common/SPELLS/classic/paladin';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import { Build } from '../CONFIG';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    const build = this.owner.build;
    return [
      // Rotational
      {
        spell: [SPELLS.CRUSADER_STRIKE.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        cooldown: 4,
        castEfficiency: {
          suggestion: build === Build.RET ? true : false,
          recommendedEfficiency: 0.8,
        },
        enabled: build === Build.RET ? true : false,
      },
      {
        spell: [SPELLS.SEAL_OF_COMMAND_DMG.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[2] >= 10,
      },
      {
        spell: [SPELLS.JUDGEMENT_OF_LIGHT.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.JUDGEMENT_OF_WISDOM.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.DIVINE_STORM.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[2] >= 50,
      },
      {
        spell: [SPELLS.SHIELD_OF_RIGHTEOUSNESS.id, ...SPELLS.SHIELD_OF_RIGHTEOUSNESS.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HOLY_SHIELD.id, ...SPELLS.HOLY_SHIELD.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[1] >= 30,
      },
      {
        spell: [SPELLS.HAMMER_OF_WRATH.id, ...SPELLS.HAMMER_OF_WRATH.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.EXORCISM.id, ...SPELLS.EXORCISM.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      /// Healing
      {
        spell: [SPELLS.FLASH_OF_LIGHT.id, ...SPELLS.FLASH_OF_LIGHT.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HOLY_LIGHT.id, ...SPELLS.HOLY_LIGHT.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SACRED_SHIELD.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HOLY_SHOCK.id, ...SPELLS.HOLY_SHOCK.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[0] >= 30,
      },
      {
        spell: [SPELLS.BEACON_OF_LIGHT.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[0] >= 50,
      },
      {
        spell: [SPELLS.HAMMER_OF_THE_RIGHTEOUS.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[1] >= 50,
        cooldown: 6,
      },
      // Rotational AOE
      {
        spell: [SPELLS.CONSECRATION.id, ...SPELLS.CONSECRATION.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
        cooldown: 8,
      },
      // Cooldowns
      {
        spell: [SPELLS.AURA_MASTERY.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[0] >= 10,
        cooldown: 120,
      },
      {
        spell: [SPELLS.DIVINE_FAVOR.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[0] >= 20,
        cooldown: 120,
      },
      {
        spell: [SPELLS.DIVINE_ILLUMINATION.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[0] >= 40,
        cooldown: 180,
      },
      {
        spell: [SPELLS.DIVINE_PLEA.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 60,
      },
      {
        spell: [SPELLS.AVENGING_WRATH.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: build === Build.RET ? 120 : 180,
      },
      {
        spell: [SPELLS.AVENGERS_SHIELD.id, ...SPELLS.AVENGERS_SHIELD.lowRanks],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[1] >= 40,
        cooldown: 30,
      },
      {
        spell: [SPELLS.DIVINE_SACRIFICE.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[1] >= 10,
        cooldown: 120,
      },
      {
        spell: [SPELLS.HOLY_WRATH.id, ...SPELLS.HOLY_WRATH.lowRanks],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 30,
      },
      // Defensive
      {
        spell: [SPELLS.DIVINE_PROTECTION.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
        cooldown: 180,
      },
      {
        spell: [SPELLS.DIVINE_SHIELD.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
        cooldown: 300,
      },
      // Utility
      {
        spell: [SPELLS.HAMMER_OF_JUSTICE.id, ...SPELLS.HAMMER_OF_JUSTICE.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.REPENTANCE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[2] >= 30,
      },
      {
        spell: [SPELLS.CLEANSE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.PURIFY.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HAND_OF_SALVATION.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HAND_OF_PROTECTION.id, ...SPELLS.HAND_OF_PROTECTION.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HAND_OF_FREEDOM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HAND_OF_SACRIFICE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.RIGHTEOUS_DEFENSE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.LAY_ON_HANDS.id, ...SPELLS.LAY_ON_HANDS.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.RIGHTEOUS_FURY.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.DIVINE_INTERVENTION.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.TURN_EVIL.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
    ];
  }
}

export default Abilities;

import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

import CoreAbilities from 'Parser/Core/Modules/Abilities';
import ITEMS from 'common/ITEMS';

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilities.ABILITIES,
    {
      spell: SPELLS.HOLY_SHOCK_CAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => {
        const cdr = combatant.hasBuff(SPELLS.AVENGING_WRATH.id) && combatant.hasTalent(SPELLS.SANCTIFIED_WRATH_TALENT.id) ? 0.5 : 0;
        return 9 / (1 + haste) * (1 - cdr);
      },
      isOnGCD: true,
      extraSuggestion: 'Casting Holy Shock regularly is very important for performing well.',
    },
    {
      spell: SPELLS.LIGHT_OF_DAWN_CAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      // Item - Paladin T20 Holy 2P Bonus: Reduces the cooldown of Light of Dawn by 2.0 sec.
      getCooldown: (haste, combatant) => (12 - (combatant.hasBuff(SPELLS.HOLY_PALADIN_T20_2SET_BONUS_BUFF.id) ? 2 : 0)) / (1 + haste),
      isOnGCD: true,
      extraSuggestion: 'Casting Light of Dawn regularly is very important for performing well.',
    },
    {
      spell: SPELLS.JUDGMENT_CAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 12 / (1 + haste),
      isActive: combatant => combatant.hasTalent(SPELLS.JUDGMENT_OF_LIGHT_TALENT.id) || combatant.hasFinger(ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.id),
      isOnGCD: true,
      recommendedEfficiency: 0.85, // this rarely overheals, so keeping this on cooldown is pretty much always best
      extraSuggestion: <span>You should cast it whenever <SpellLink id={SPELLS.JUDGMENT_OF_LIGHT_TALENT.id} /> has dropped, which is usually on cooldown without delay. Alternatively you can ignore the debuff and just cast it whenever Judgment is available; there's nothing wrong with ignoring unimportant things to focus on important things.</span>,
    },
    {
      spell: SPELLS.BESTOW_FAITH_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 12,
      isActive: combatant => combatant.hasTalent(SPELLS.BESTOW_FAITH_TALENT.id),
      isOnGCD: true,
      recommendedEfficiency: 0.7,
      extraSuggestion: <span>If you can't or don't want to cast it more consider using <SpellLink id={SPELLS.LIGHTS_HAMMER_TALENT.id} /> or <SpellLink id={SPELLS.CRUSADERS_MIGHT_TALENT.id} /> instead.</span>,
    },
    {
      spell: SPELLS.LIGHTS_HAMMER_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 60,
      isActive: combatant => combatant.hasTalent(SPELLS.LIGHTS_HAMMER_TALENT.id),
      isOnGCD: true,
    },
    {
      spell: SPELLS.BEACON_OF_VIRTUE_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 15,
      isActive: combatant => combatant.hasTalent(SPELLS.BEACON_OF_VIRTUE_TALENT.id),
      isOnGCD: true,
    },
    {
      spell: SPELLS.CRUSADER_STRIKE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 4.5 / (1 + haste),
      charges: 2,
      isActive: combatant => combatant.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id),
      isOnGCD: true,
      recommendedEfficiency: 0.35,
      extraSuggestion: <span>When you are using <SpellLink id={SPELLS.CRUSADERS_MIGHT_TALENT.id} /> it is important to use <SpellLink id={SPELLS.CRUSADER_STRIKE.id} /> often enough to benefit from the talent. Use a different talent if you are unable to.</span>,
    },
    {
      spell: SPELLS.HOLY_PRISM_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 20,
      isActive: combatant => combatant.hasTalent(SPELLS.HOLY_PRISM_TALENT.id),
      isOnGCD: true,
    },
    {
      spell: SPELLS.RULE_OF_LAW_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 30,
      charges: 2,
      isActive: combatant => combatant.hasTalent(SPELLS.RULE_OF_LAW_TALENT.id),
      noSuggestion: true,
    },
    {
      spell: SPELLS.DIVINE_PROTECTION,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      recommendedEfficiency: 0.6,
      importance: ISSUE_IMPORTANCE.MINOR,
    },
    {
      spell: SPELLS.DIVINE_SHIELD,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 5 * 60,
      isOnGCD: true,
      importance: ISSUE_IMPORTANCE.MINOR,
      noSuggestion: true,
    },
    {
      spell: SPELLS.ARCANE_TORRENT_MANA,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      isUndetectable: true,
    },
    {
      spell: SPELLS.TYRS_DELIVERANCE_CAST,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      isOnGCD: true,
    },
    {
      spell: SPELLS.HOLY_AVENGER_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      isActive: combatant => combatant.hasTalent(SPELLS.HOLY_AVENGER_TALENT.id),
    },
    {
      spell: SPELLS.AVENGING_WRATH,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
    },
    {
      spell: SPELLS.BLESSING_OF_SACRIFICE,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 150,
      recommendedEfficiency: 0.5,
      noSuggestion: true,
      importance: ISSUE_IMPORTANCE.MINOR,
    },
    {
      spell: SPELLS.AURA_MASTERY,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
    },
    {
      spell: SPELLS.LAY_ON_HANDS,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => 600 * (1 - (combatant.traitsBySpellId[SPELLS.FOCUSED_HEALING.id] || 0) * 0.1),
      recommendedEfficiency: 0.2,
    },
    {
      spell: SPELLS.LIGHT_OF_THE_MARTYR,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
      isOnGCD: true,
    },
    {
      spell: SPELLS.FLASH_OF_LIGHT,
      name: `Filler ${SPELLS.FLASH_OF_LIGHT.name}`,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCasts: castCount => (castCount.casts || 0) - (castCount.healingIolHits || 0),
      getCooldown: haste => null,
      getChannel: haste => 1500 / (1 + haste),
      isOnGCD: true,
    },
    {
      spell: SPELLS.FLASH_OF_LIGHT,
      name: `Infusion of Light ${SPELLS.FLASH_OF_LIGHT.name}`,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCasts: castCount => castCount.healingIolHits || 0,
      getCooldown: haste => null,
      getChannel: haste => 1500 / (1 + haste),
      isOnGCD: true,
    },
    {
      spell: SPELLS.HOLY_LIGHT,
      name: `Filler ${SPELLS.HOLY_LIGHT.name}`,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCasts: castCount => (castCount.casts || 0) - (castCount.healingIolHits || 0),
      getCooldown: haste => null,
      isOnGCD: true,
    },
    {
      spell: SPELLS.HOLY_LIGHT,
      name: `Infusion of Light ${SPELLS.HOLY_LIGHT.name}`,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCasts: castCount => castCount.healingIolHits || 0,
      getCooldown: haste => null,
      isOnGCD: true,
    },
    {
      spell: SPELLS.DIVINE_STEED,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 45,
      isActive: combatant => !combatant.hasTalent(SPELLS.CAVALIER_TALENT.id),
      isOnGCD: true,
      recommendedEfficiency: 0.5,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.DIVINE_STEED,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 45,
      charges: 2,
      isActive: combatant => combatant.hasTalent(SPELLS.CAVALIER_TALENT.id),
      isOnGCD: true,
      recommendedEfficiency: 0.5,
      noSuggestion: true,
    },
    {
      spell: SPELLS.CLEANSE,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 8,
      isOnGCD: true,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.BLESSING_OF_FREEDOM,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 25,
      isOnGCD: true,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.BLESSING_OF_PROTECTION,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 5 * 60,
      isOnGCD: true,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      // The actual casts are registered as BEACON_OF_LIGHT_CAST_AND_HEAL, but the user only sees the talent so we add that as spell for display purposes only
      spell: [SPELLS.BEACON_OF_THE_LIGHTBRINGER_TALENT, SPELLS.BEACON_OF_LIGHT_CAST_AND_HEAL],
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.BEACON_OF_THE_LIGHTBRINGER_TALENT.id),
      isOnGCD: true,
    },
    {
      // The primary beacon cast is registered as BEACON_OF_LIGHT_CAST_AND_HEAL
      spell: [SPELLS.BEACON_OF_FAITH_TALENT, SPELLS.BEACON_OF_LIGHT_CAST_AND_HEAL],
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.BEACON_OF_FAITH_TALENT.id),
      isOnGCD: true,
    },
    {
      spell: SPELLS.CRUSADER_STRIKE,
      category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
      getCooldown: haste => 4.5 / (1 + haste),
      charges: 2,
      isActive: combatant => !combatant.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id),
      isOnGCD: true,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.CONSECRATION_CAST,
      category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
      getCooldown: haste => 9 / (1 + haste),
      isOnGCD: true,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.BLINDING_LIGHT_TALENT,
      category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
      getCooldown: haste => 90,
      isOnGCD: true,
      noSuggestion: true,
      noCanBeImproved: true,
    },
  ];
}

export default Abilities;

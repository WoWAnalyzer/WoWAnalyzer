import React from 'react';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import CoreAbilities from 'Parser/Core/Modules/Abilities';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.HOLY_SHOCK_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste, combatantCurrent) => {
          const hasSanctifiedWrath = combatant.hasTalent(SPELLS.SANCTIFIED_WRATH_TALENT.id);
          const cdr = hasSanctifiedWrath && combatantCurrent.hasBuff(SPELLS.AVENGING_WRATH.id) ? 0.5 : 0;
          return 9 / (1 + haste) * (1 - cdr);
        },
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          extraSuggestion: 'Casting Holy Shock regularly is very important for performing well.',
        },
      },
      {
        spell: SPELLS.LIGHT_OF_DAWN_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        // Item - Paladin T20 Holy 2P Bonus: Reduces the cooldown of Light of Dawn by 2.0 sec.
        cooldown: haste => (12 - (combatant.hasBuff(SPELLS.HOLY_PALADIN_T20_2SET_BONUS_BUFF.id) ? 2 : 0)) / (1 + haste),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          extraSuggestion: 'Casting Light of Dawn regularly is very important for performing well.',
        },
      },
      {
        spell: SPELLS.JUDGMENT_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 12 / (1 + haste),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          extraSuggestion: (
            <Wrapper>
              You should cast it whenever <SpellLink id={SPELLS.JUDGMENT_OF_LIGHT_TALENT.id} /> has dropped, which is usually on cooldown without delay. Alternatively you can ignore the debuff and just cast it whenever Judgment is available; there's nothing wrong with ignoring unimportant things to focus on important things.
            </Wrapper>
          ),
          recommendedEfficiency: 0.85, // this rarely overheals, so keeping this on cooldown is pretty much always best
        },
        enabled: combatant.hasTalent(SPELLS.JUDGMENT_OF_LIGHT_TALENT.id) || combatant.hasFinger(ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.id),
      },
      {
        spell: SPELLS.BESTOW_FAITH_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 12,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.7,
          extraSuggestion: (
            <Wrapper>
              If you can't or don't want to cast it more consider using <SpellLink id={SPELLS.LIGHTS_HAMMER_TALENT.id} /> or <SpellLink id={SPELLS.CRUSADERS_MIGHT_TALENT.id} /> instead.
            </Wrapper>
          ),
        },
        enabled: combatant.hasTalent(SPELLS.BESTOW_FAITH_TALENT.id),
      },
      {
        spell: SPELLS.LIGHTS_HAMMER_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.LIGHTS_HAMMER_TALENT.id),
      },
      {
        spell: SPELLS.BEACON_OF_VIRTUE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 15,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.BEACON_OF_VIRTUE_TALENT.id),
      },
      {
        spell: SPELLS.CRUSADER_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 4.5 / (1 + haste),
        charges: 2,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          extraSuggestion: (
            <Wrapper>
              When you are using <SpellLink id={SPELLS.CRUSADERS_MIGHT_TALENT.id} /> it is important to use <SpellLink id={SPELLS.CRUSADER_STRIKE.id} /> often enough to benefit from the talent. Use a different talent if you are unable to.
            </Wrapper>
          ),
          recommendedEfficiency: 0.35,
        },
        enabled: combatant.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id),
      },
      {
        spell: SPELLS.HOLY_PRISM_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 20,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.HOLY_PRISM_TALENT.id),
      },
      {
        spell: SPELLS.RULE_OF_LAW_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        charges: 2,
        enabled: combatant.hasTalent(SPELLS.RULE_OF_LAW_TALENT.id),
      },
      {
        spell: SPELLS.DIVINE_PROTECTION,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      {
        spell: SPELLS.DIVINE_SHIELD,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 5 * 60,
        isOnGCD: true,
      },
      {
        spell: SPELLS.ARCANE_TORRENT_MANA,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        isUndetectable: true,
      },
      {
        spell: SPELLS.TYRS_DELIVERANCE_CAST,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        isOnGCD: true,
      },
      {
        spell: SPELLS.HOLY_AVENGER_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        enabled: combatant.hasTalent(SPELLS.HOLY_AVENGER_TALENT.id),
      },
      {
        spell: SPELLS.AVENGING_WRATH,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
      },
      {
        spell: SPELLS.BLESSING_OF_SACRIFICE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 150,
      },
      {
        spell: SPELLS.AURA_MASTERY,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
      },
      {
        spell: SPELLS.LAY_ON_HANDS,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 600 * (1 - (combatant.traitsBySpellId[SPELLS.FOCUSED_HEALING.id] || 0) * 0.1),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.1,
        },
      },
      {
        spell: SPELLS.LIGHT_OF_THE_MARTYR,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isOnGCD: true,
      },
      {
        spell: SPELLS.FLASH_OF_LIGHT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        channel: haste => 1.5 / (1 + haste),
        isOnGCD: true,
        castEfficiency: {
          name: `Filler ${SPELLS.FLASH_OF_LIGHT.name}`,
          casts: castCount => (castCount.casts || 0) - (castCount.healingIolHits || 0),
        },
      },
      {
        spell: SPELLS.FLASH_OF_LIGHT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        channel: haste => 1.5 / (1 + haste),
        isOnGCD: true,
        castEfficiency: {
          name: `${SPELLS.INFUSION_OF_LIGHT.name} ${SPELLS.FLASH_OF_LIGHT.name}`,
          casts: castCount => castCount.healingIolHits || 0,
        },
      },
      {
        spell: SPELLS.HOLY_LIGHT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isOnGCD: true,
        castEfficiency: {
          name: `Filler ${SPELLS.HOLY_LIGHT.name}`,
          casts: castCount => (castCount.casts || 0) - (castCount.healingIolHits || 0),
        },
      },
      {
        spell: SPELLS.HOLY_LIGHT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isOnGCD: true,
        castEfficiency: {
          name: `${SPELLS.INFUSION_OF_LIGHT.name} ${SPELLS.HOLY_LIGHT.name}`,
          casts: castCount => castCount.healingIolHits || 0,
        },
      },
      {
        spell: SPELLS.DIVINE_STEED,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        enabled: !combatant.hasTalent(SPELLS.CAVALIER_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.DIVINE_STEED,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        charges: 2,
        enabled: combatant.hasTalent(SPELLS.CAVALIER_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.CLEANSE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
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
      },
      {
        // The actual casts are registered as BEACON_OF_LIGHT_CAST_AND_HEAL, but the user only sees the talent so we add that as spell for display purposes only
        spell: [SPELLS.BEACON_OF_THE_LIGHTBRINGER_TALENT, SPELLS.BEACON_OF_LIGHT_CAST_AND_HEAL],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.BEACON_OF_THE_LIGHTBRINGER_TALENT.id),
      },
      {
        // The primary beacon cast is registered as BEACON_OF_LIGHT_CAST_AND_HEAL
        spell: [SPELLS.BEACON_OF_FAITH_TALENT, SPELLS.BEACON_OF_LIGHT_CAST_AND_HEAL],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.BEACON_OF_FAITH_TALENT.id),
      },
      {
        spell: SPELLS.CRUSADER_STRIKE,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        cooldown: haste => 4.5 / (1 + haste),
        charges: 2,
        enabled: !combatant.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.CONSECRATION_CAST,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        cooldown: haste => 9 / (1 + haste),
        isOnGCD: true,
      },
      {
        spell: SPELLS.BLINDING_LIGHT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
        enabled: combatant.hasTalent(SPELLS.BLINDING_LIGHT_TALENT.id),
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
    ];
  }
}

export default Abilities;

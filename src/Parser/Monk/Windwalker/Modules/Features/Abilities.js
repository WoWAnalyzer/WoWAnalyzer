import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilities.ABILITIES,
    {
      spell: SPELLS.STRIKE_OF_THE_WINDLORD,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      // Item - The legendary head reduces SotW cooldown by 20%
      // Serenity cooldown reduction behaves like dynamic haste, where abilites cool down at their normal rate outside the buff. Chi Spenders with cooldowns longer than Serenity duration instead has a potential cooldown reduction of the total Serenity duration. 
      getCooldown: (haste, combatant) => 40 * (combatant.hasHead(ITEMS.THE_WIND_BLOWS.id) ? 0.8 : 1) - (combatant.hasBuff(SPELLS.SERENITY_TALENT.id) ? (combatant.hasWrists(ITEMS.DRINKING_HORN_COVER.id) ? 11 : 8) : 0),
      recommendedCastEfficiency: 0.9,
    },
    {
      spell: SPELLS.FISTS_OF_FURY_CAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      // This can get way too low calculated cooldown if the player has a very high amount of haste, but this is not expected for windwalkers
      getCooldown: (haste, combatant) =>
        24 / (1 + haste) - (combatant.hasBuff(SPELLS.SERENITY_TALENT.id) ? (combatant.hasWrists(ITEMS.DRINKING_HORN_COVER.id) ? 11 : 8) : 0),
      extraSuggestion: "Delaying the cast somewhat to line up with add spawns is acceptable, however.",
      recommendedCastEfficiency: 0.9,
    },
    {
      spell: SPELLS.RISING_SUN_KICK,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      // Item - Windwalker T19 2PC Bonus: Reduces the cooldown of Rising Sun Kick by 1.0 seconds.
      getCooldown: (haste, combatant) =>
        (10 - (combatant.hasBuff(SPELLS.WW_TIER19_2PC.id) ? 1 : 0)) / (1 + haste) * (combatant.hasBuff(SPELLS.SERENITY_TALENT.id) ? 0.5 : 1),
    },
    {
      spell: SPELLS.WHIRLING_DRAGON_PUNCH_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 24 / (1 + haste),
      isActive: combatant => combatant.hasTalent(SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id),
      extraSuggestion: "Delaying the cast somewhat to line up with add spawns is acceptable, however.",
      recommendedCastEfficiency: 0.9,
    },
    // cooldowns
    {
      spell: SPELLS.TOUCH_OF_KARMA_CAST,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
    },
    {
      spell: SPELLS.TOUCH_OF_DEATH,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
      recommendedCastEfficiency: 0.95,
    },
    {
      spell: SPELLS.SERENITY_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (_, combatant) => combatant.owner.modules.stormEarthAndFire.reducedCooldownWithTraits,
      isActive: combatant => combatant.hasTalent(SPELLS.SERENITY_TALENT.id),
      recommendedCastEfficiency: 0.95,
    },
    {
      spell: SPELLS.STORM_EARTH_AND_FIRE_CAST,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (_, combatant) => combatant.owner.modules.stormEarthAndFire.reducedCooldownWithTraits,
      isActive: combatant => combatant.hasTalent(SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id),
      charges: 2,
      recommendedCastEfficiency: 0.95,
    },
    {
      spell: SPELLS.INVOKE_XUEN_THE_WHITE_TIGER_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => combatant.hasTalent(SPELLS.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id),
      recommendedCastEfficiency: 1.0,
    },
    {
  spell: SPELLS.ENERGIZING_ELIXIR_TALENT,
  category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
  getCooldown: haste => 60,
  isActive: combatant => combatant.hasTalent(SPELLS.ENERGIZING_ELIXIR_TALENT.id),
  noSuggestion: true,
},
    // other spells
    {
      spell: SPELLS.BLACKOUT_KICK,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.TIGER_PALM,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.CHI_WAVE_TALENT,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => 15,
      isActive: combatant => combatant.hasTalent(SPELLS.CHI_WAVE_TALENT.id),
      recommendedCastEfficiency: 0.7,
    },
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.CRACKLING_JADE_LIGHTNING,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(ITEMS.THE_EMPERORS_CAPACITOR.id),
    },
    {
      spell: SPELLS.RUSHING_JADE_WIND_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => 6 / (1 + haste),
      isActive: combatant => combatant.hasTalent(SPELLS.RUSHING_JADE_WIND_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
  ];
}

export default Abilities;

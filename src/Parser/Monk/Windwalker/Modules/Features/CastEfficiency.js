import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    {
      spell: SPELLS.STRIKE_OF_THE_WINDLORD,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      // Item - The legendary head reduces SotW cooldown by 20%
      getCooldown: (haste, combatant) => 40 * (combatant.hasHead(ITEMS.THE_WIND_BLOWS.id) ? 0.8 : 1) * (combatant.hasBuff(SPELLS.SERENITY_TALENT.id) ? 0.5 : 1),
    },
    {
      spell: SPELLS.FISTS_OF_FURY_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) =>
        24 / (1 + haste) * (combatant.hasBuff(SPELLS.SERENITY_TALENT.id) ? 0.5 : 1),
    },
    {
      spell: SPELLS.RISING_SUN_KICK,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      // Item - Windwalker T19 2PC Bonus: Reduces the cooldown of Rising Sun Kick by 1.0 seconds.
      getCooldown: (haste, combatant) =>
        (10 - (combatant.hasBuff(SPELLS.WW_TIER19_2PC.id) ? 1 : 0)) / (1 + haste) * (combatant.hasBuff(SPELLS.SERENITY_TALENT.id) ? 0.5 : 1),
    },
    {
      spell: SPELLS.WHIRLING_DRAGON_PUNCH_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 24 / (1 + haste),
      isActive: combatant => combatant.hasTalent(SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id),
    },
    // cooldowns
    {
      spell: SPELLS.TOUCH_OF_KARMA_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
    },
    {
      spell: SPELLS.TOUCH_OF_DEATH,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
    },
    {
      spell: SPELLS.SERENITY_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (_, combatant) => combatant.owner.modules.stormEarthAndFire.reducedCooldownWithTraits,
      isActive: combatant => combatant.hasTalent(SPELLS.SERENITY_TALENT.id),
    },
    {
      spell: SPELLS.STORM_EARTH_AND_FIRE_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (_, combatant) => combatant.owner.modules.stormEarthAndFire.reducedCooldownWithTraits,
      isActive: combatant => combatant.hasTalent(SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id),
      charges: 2,
    },
    {
      spell: SPELLS.INVOKE_XUEN_THE_WHITE_TIGER_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => combatant.hasTalent(SPELLS.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id),
    },
    // other spells
    {
      spell: SPELLS.BLACKOUT_KICK,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.TIGER_PALM,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.CHI_WAVE_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => 15,
      isActive: combatant => combatant.hasTalent(SPELLS.CHI_WAVE_TALENT.id),
    },
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.RUSHING_JADE_WIND_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => 6 / (1 + haste),
      noSuggestion: true,
    },
  ];
}

export default CastEfficiency;

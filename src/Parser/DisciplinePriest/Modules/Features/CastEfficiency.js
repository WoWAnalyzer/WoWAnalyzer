import SPELLS from 'common/SPELLS';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import { calculateMaxCasts } from 'Parser/Core/getCastEfficiency';

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    {
      spell: SPELLS.PENANCE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCasts: (_, parser) => parser.modules.penance.casts,
      getCooldown: haste => 9,
    },
    {
      spell: SPELLS.POWER_WORD_RADIANCE,
      name: `${SPELLS.POWER_WORD_RADIANCE.name}`,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 18,
      getCasts: castCount => castCount.casts,
      getMaxCasts: (cooldown, fightDuration, getAbility, parser) => calculateMaxCasts(cooldown, fightDuration, 2),
    },
    {
      spell: SPELLS.EVANGELISM_TALENT,
      name: `${SPELLS.EVANGELISM_TALENT.name}`,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 75,
      getCasts: castCount => castCount.casts,
    },
    {
      spell: SPELLS.POWER_WORD_SHIELD,
      name: `${SPELLS.POWER_WORD_SHIELD.name} outside Rapture`,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 9 / (1 + haste),
      getCasts: castCount => castCount.casts - (castCount.raptureCasts || 0),
      getMaxCasts: (cooldown, fightDuration, getAbility, parser) => {
        const timeSpentInRapture = parser.modules.combatants.selected.getBuffUptime(SPELLS.RAPTURE.id);
        const maxRegularCasts = calculateMaxCasts(cooldown, fightDuration - timeSpentInRapture);

        return maxRegularCasts;
      },
    },
    {
      spell: SPELLS.POWER_WORD_SHIELD,
      name: `${SPELLS.POWER_WORD_SHIELD.name} during Rapture`,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      extraSuggestion: `${SPELLS.POWER_WORD_SHIELD.name} may be cast without cooldown during Rapture.`,
      getCooldown: haste => 9 / (1 + haste),
      getCasts: castCount => castCount.raptureCasts || 0,
      getMaxCasts: (cooldown, fightDuration, getAbility, parser) => {
        const gcd = 1.5 / (1 + parser.modules.combatants.selected.hastePercentage);
        const timeSpentInRapture = parser.modules.combatants.selected.getBuffUptime(SPELLS.RAPTURE.id);

        const maxRaptureCasts = calculateMaxCasts(gcd, timeSpentInRapture);

        return maxRaptureCasts;
      },
    },
    {
      spell: SPELLS.SCHISM_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 6,
      isActive: combatant => combatant.hasTalent(SPELLS.SCHISM_TALENT.id),
    },
    {
      spell: SPELLS.POWER_WORD_SOLACE_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 12 / (1 + haste),
      isActive: combatant => combatant.hasTalent(SPELLS.POWER_WORD_SOLACE_TALENT.id),
    },
    {
      spell: SPELLS.DIVINE_STAR_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 15,
      isActive: combatant => combatant.hasTalent(SPELLS.DIVINE_STAR_TALENT.id),
    },
    {
      spell: SPELLS.HALO_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 40,
      isActive: combatant => combatant.hasTalent(SPELLS.HALO_TALENT.id),
      getOverhealing: (_, getAbility) => {
        const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.HALO_HEAL.id);
        return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
      },
    },
    {
      spell: SPELLS.LIGHTS_WRATH,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 90,
    },

    {
      spell: SPELLS.MINDBENDER_TALENT_SHARED,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      isActive: combatant => combatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHARED.id),
    },
    {
      spell: SPELLS.SHADOWFIEND,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => !combatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHARED.id),
    },
    {
      spell: SPELLS.RAPTURE,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
    },
    {
      spell: SPELLS.POWER_INFUSION_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
      isActive: combatant => combatant.hasTalent(SPELLS.POWER_INFUSION_TALENT.id),
    },
    {
      spell: SPELLS.PAIN_SUPPRESSION,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => 4 * 60 - (combatant.traitsBySpellId[SPELLS.PAIN_IS_IN_YOUR_MIND.id] || 0) * 10,
      noSuggestion: true,
    },
    {
      spell: SPELLS.POWER_WORD_BARRIER_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 3 * 60,
      noSuggestion: true,
    },

    {
      spell: SPELLS.POWER_WORD_RADIANCE,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.SHADOW_WORD_PAIN,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
      isActive: combatant => !combatant.hasTalent(SPELLS.PURGE_THE_WICKED_TALENT.id),
    },
    {
      spell: SPELLS.PURGE_THE_WICKED_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.PURGE_THE_WICKED_TALENT.id),
    },
    {
      spell: SPELLS.SHADOW_COVENANT_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.SHADOW_COVENANT_TALENT.id),
    },
    {
      spell: SPELLS.CLARITY_OF_WILL_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.CLARITY_OF_WILL_TALENT.id),
    },
    {
      spell: SPELLS.PLEA,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.SMITE,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },

    {
      spell: SPELLS.ANGELIC_FEATHER_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 20,
      isActive: combatant => combatant.hasTalent(SPELLS.ANGELIC_FEATHER_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SHINING_FORCE_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 45,
      isActive: combatant => combatant.hasTalent(SPELLS.SHINING_FORCE_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.FADE,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.LEAP_OF_FAITH,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 150,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.MIND_CONTROL,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: (haste, selectedCombatant) => (selectedCombatant.hasTalent(SPELLS.DOMINANT_MIND_TALENT.id) ? 120 : 0),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.MASS_DISPEL,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 15,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.DISPEL_MAGIC,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.PURIFY,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 8,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SHACKLE_UNDEAD,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.PSYCHIC_SCREAM,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: (haste, selectedCombatant) => 60 - (selectedCombatant.hasTalent(SPELLS.PSYCHIC_VOICE_TALENT.id) ? 30 : 0),
      noSuggestion: true,
      noCanBeImproved: true,
    },
  ];
}

export default CastEfficiency;

import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';
import calculateMaxCasts from 'Parser/Core/calculateMaxCasts';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.PENANCE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 9,
        castEfficiency: {
          suggestion: true,
          casts: (_, parser) => parser.modules.penance.casts,
          maxCasts: (cooldown, fightDuration) => calculateMaxCasts(cooldown, fightDuration), // temp until bolts past first can be ignored by cast checker
        },
      },
      {
        spell: SPELLS.POWER_WORD_RADIANCE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 18,
        charges: 2,
        castEfficiency: {
          suggestion: true,
          casts: castCount => castCount.casts,
        },
      },
      {
        spell: SPELLS.EVANGELISM_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 75,
        castEfficiency: {
          suggestion: true,
          casts: castCount => castCount.casts,
        },
      },
      {
        spell: SPELLS.POWER_WORD_SHIELD,
        name: `${SPELLS.POWER_WORD_SHIELD.name} outside Rapture`,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 9 / (1 + haste),
        castEfficiency: {
          suggestion: true,
          casts: castCount => castCount.casts - (castCount.raptureCasts || 0),
          maxCasts: (cooldown, fightDuration, getAbility, parser) => {
            const timeSpentInRapture = parser.modules.combatants.selected.getBuffUptime(SPELLS.RAPTURE.id);
            const maxRegularCasts = calculateMaxCasts(cooldown, fightDuration - timeSpentInRapture);

            return maxRegularCasts;
          },
        },
      },
      {
        spell: SPELLS.POWER_WORD_SHIELD,
        name: `${SPELLS.POWER_WORD_SHIELD.name} during Rapture`,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 9 / (1 + haste),
        castEfficiency: {
          suggestion: true,
          extraSuggestion: `${SPELLS.POWER_WORD_SHIELD.name} may be cast without cooldown during Rapture.`,
          casts: castCount => castCount.raptureCasts || 0,
          maxCasts: (cooldown, fightDuration, getAbility, parser) => {
            const gcd = 1.5 / (1 + parser.modules.combatants.selected.hastePercentage);
            const timeSpentInRapture = parser.modules.combatants.selected.getBuffUptime(SPELLS.RAPTURE.id);

            const maxRaptureCasts = calculateMaxCasts(gcd, timeSpentInRapture);

            return maxRaptureCasts;
          },
        },
      },
      // TODO this should work, but is being quite harsh due to max casts calc ...
      // {
      //   spell: SPELLS.POWER_WORD_SHIELD,
      //   category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      //   cooldown: (haste, combatant) => {
      //     if(combatant.hasBuff(SPELLS.RAPTURE.id)) {
      //       return 1.5 / (1 + haste); // TODO should there be an external 'GCD getter' ?
      //     } else {
      //       return 9 / (1 + haste);
      //     }
      //   },
      // },
      {
        spell: SPELLS.SCHISM_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 6,
        enabled: combatant.hasTalent(SPELLS.SCHISM_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.POWER_WORD_SOLACE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 12 / (1 + haste),
        enabled: combatant.hasTalent(SPELLS.POWER_WORD_SOLACE_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.DIVINE_STAR_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 15,
        enabled: combatant.hasTalent(SPELLS.DIVINE_STAR_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.HALO_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 40,
        enabled: combatant.hasTalent(SPELLS.HALO_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.LIGHTS_WRATH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
        },
      },

      {
        spell: SPELLS.MINDBENDER_TALENT_SHARED,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        enabled: combatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHARED.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.SHADOWFIEND,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: !combatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHARED.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.RAPTURE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.POWER_INFUSION_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.POWER_INFUSION_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.PAIN_SUPPRESSION,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (haste, combatant) => 4 * 60 - (combatant.traitsBySpellId[SPELLS.PAIN_IS_IN_YOUR_MIND.id] || 0) * 10,
      },
      {
        spell: SPELLS.POWER_WORD_BARRIER_CAST,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 3 * 60,
      },

      {
        spell: SPELLS.POWER_WORD_RADIANCE,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },
      {
        spell: SPELLS.SHADOW_WORD_PAIN,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: !combatant.hasTalent(SPELLS.PURGE_THE_WICKED_TALENT.id),
      },
      {
        spell: SPELLS.PURGE_THE_WICKED_TALENT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.PURGE_THE_WICKED_TALENT.id),
      },
      {
        spell: SPELLS.SHADOW_COVENANT_TALENT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.SHADOW_COVENANT_TALENT.id),
      },
      {
        spell: SPELLS.CLARITY_OF_WILL_TALENT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.CLARITY_OF_WILL_TALENT.id),
      },
      {
        spell: SPELLS.PLEA,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },
      {
        spell: SPELLS.SMITE,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },

      {
        spell: SPELLS.ANGELIC_FEATHER_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20,
        enabled: combatant.hasTalent(SPELLS.ANGELIC_FEATHER_TALENT.id),
      },
      {
        spell: SPELLS.SHINING_FORCE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.SHINING_FORCE_TALENT.id),
      },
      {
        spell: SPELLS.FADE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
      },
      {
        spell: SPELLS.LEAP_OF_FAITH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 150,
      },
      {
        spell: SPELLS.MIND_CONTROL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: (haste, selectedCombatant) => selectedCombatant.hasTalent(SPELLS.DOMINANT_MIND_TALENT.id) ? 120 : 0,
      },
      {
        spell: SPELLS.MASS_DISPEL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
      },
      {
        spell: SPELLS.DISPEL_MAGIC,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      {
        spell: SPELLS.PURIFY,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
      },
      {
        spell: SPELLS.SHACKLE_UNDEAD,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      {
        spell: SPELLS.PSYCHIC_SCREAM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: (haste, selectedCombatant) => 60 - (selectedCombatant.hasTalent(SPELLS.PSYCHIC_VOICE_TALENT.id) ? 30 : 0),
      },
    ];
  }
}

export default Abilities;

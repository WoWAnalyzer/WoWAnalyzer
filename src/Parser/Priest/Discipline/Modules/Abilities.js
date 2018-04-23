import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';
import Combatants from 'Parser/Core/Modules/Combatants';
import Haste from 'Parser/Core/Modules/Haste';

class Abilities extends CoreAbilities {
  static dependencies = {
    ...CoreAbilities.dependencies,
    combatants: Combatants,
    haste: Haste,
  };

  spellbook() {
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.PENANCE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 9,
      },
      {
        spell: SPELLS.POWER_WORD_RADIANCE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 18 - (combatant.hasBuff(SPELLS.DISC_PRIEST_T21_2SET_BONUS_PASSIVE.id) ? 3 : 0),
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
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.SCHISM_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 24,
        enabled: combatant.hasTalent(SPELLS.SCHISM_TALENT.id),
        castEfficiency: {
          suggestion: false, // Schism won't be an on cooldown ability
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
        cooldown: 90,
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
        cooldown: 180,
      },
      {
        spell: SPELLS.POWER_WORD_BARRIER_CAST,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 3 * 60,
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

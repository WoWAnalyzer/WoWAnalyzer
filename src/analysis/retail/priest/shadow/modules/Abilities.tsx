import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      //Voidbolt is added through Voidform module.
      //SW:D is added through Shadow Word: Death module
      //VoidBlast is added through VoidBlast module.
      {
        spell: SPELLS.MIND_BLAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 9 / (1 + haste),
        gcd: {
          base: 1500,
        },
        charges: 1 + (combatant.hasTalent(TALENTS.THOUGHT_HARVESTER_TALENT) ? 1 : 0),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },
      {
        spell: SPELLS.MIND_FLAY.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled:
          combatant.hasTalent(TALENTS.SURGE_OF_INSANITY_TALENT) &&
          !combatant.hasTalent(TALENTS.MIND_SPIKE_TALENT),
      },
      {
        spell: TALENTS.MIND_SPIKE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.MIND_SPIKE_TALENT),
      },
      {
        spell: SPELLS.MIND_SPIKE_INSANITY_TALENT_DAMAGE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled:
          combatant.hasTalent(TALENTS.SURGE_OF_INSANITY_TALENT) &&
          combatant.hasTalent(TALENTS.MIND_SPIKE_TALENT),
      },
      {
        spell: TALENTS.SHADOW_CRASH_1_SHADOW_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.1,
        },
        enabled: combatant.hasTalent(TALENTS.SHADOW_CRASH_1_SHADOW_TALENT),
        damageSpellIds: [SPELLS.SHADOW_CRASH_TALENT_DAMAGE.id],
      },
      {
        spell: TALENTS.SHADOW_CRASH_2_SHADOW_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.1,
        },
        enabled: combatant.hasTalent(TALENTS.SHADOW_CRASH_2_SHADOW_TALENT),
        damageSpellIds: [SPELLS.SHADOW_CRASH_TALENT_DAMAGE.id],
      },
      {
        spell: SPELLS.SHADOW_WORD_PAIN.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.DEVOURING_PLAGUE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        insanityCost:
          5000 -
          combatant.getTalentRank(TALENTS.MINDS_EYE_TALENT) * 500 +
          combatant.getTalentRank(TALENTS.DISTORTED_REALITY_TALENT) * 500,
      },
      {
        spell: SPELLS.VAMPIRIC_TOUCH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.HALO_SHADOW_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.HALO_SHADOW_TALENT),
      },
      {
        spell: TALENTS.DIVINE_STAR_SHADOW_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.DIVINE_STAR_SHADOW_TALENT),
      },

      // Cooldowns
      {
        spell: TALENTS.VOID_ERUPTION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
        enabled: combatant.hasTalent(TALENTS.VOID_ERUPTION_TALENT),
      },
      {
        spell: TALENTS.DARK_ASCENSION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
        enabled: combatant.hasTalent(TALENTS.DARK_ASCENSION_TALENT),
      },
      {
        spell: TALENTS.VOID_TORRENT_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 45 - combatant.getTalentRank(TALENTS.MALEDICTION_TALENT) * 15,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: combatant.hasTalent(TALENTS.VOID_TORRENT_TALENT),
        damageSpellIds: [TALENTS.VOID_TORRENT_TALENT.id],
      },
      {
        spell: TALENTS.MINDBENDER_SHADOW_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled:
          combatant.hasTalent(TALENTS.MINDBENDER_SHADOW_TALENT) &&
          !combatant.hasTalent(TALENTS.VOIDWRAITH_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.SHADOW_PRIEST_VOIDWEAVER_VOIDWRAITH_CAST.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120 - (combatant.hasTalent(TALENTS.MINDBENDER_SHADOW_TALENT) ? 60 : 0), //mindbender reduces the CD of Voidwraith by 1 minute
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.VOIDWRAITH_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: [
          SPELLS.SHADOWFIEND.id,
          SPELLS.SHADOWFIEND_WITH_GLYPH_OF_THE_SHA.id,
          SPELLS.VOIDLING.id,
        ],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(TALENTS.MINDBENDER_SHADOW_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.POWER_INFUSION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
        enabled: combatant.hasTalent(TALENTS.POWER_INFUSION_TALENT),
      },

      // Utility
      {
        spell: TALENTS.DISPERSION_TALENT.id,
        isDefensive: true,
        buffSpellId: TALENTS.DISPERSION_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120 - (combatant.hasTalent(TALENTS.INTANGIBILITY_TALENT) ? 30 : 0),
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.DISPERSION_TALENT),
      },
      {
        spell: TALENTS.SILENCE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45 - (combatant.hasTalent(TALENTS.LAST_WORD_TALENT) ? 15 : 0),
        gcd: null,
        enabled: combatant.hasTalent(TALENTS.SILENCE_TALENT),
      },
      {
        spell: TALENTS.VAMPIRIC_EMBRACE_TALENT.id,
        buffSpellId: TALENTS.VAMPIRIC_EMBRACE_TALENT.id,
        isDefensive: true,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120 - (combatant.hasTalent(TALENTS.SANLAYN_TALENT) ? 45 : 0),
        gcd: null,
        enabled: combatant.hasTalent(TALENTS.VAMPIRIC_EMBRACE_TALENT),
      },
      {
        spell: SPELLS.POWER_WORD_SHIELD.id,
        isDefensive: true,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: (haste: any) => 7.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FLASH_HEAL.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DESPERATE_PRAYER.id, //TODO have angles mercy reduce CD
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90 - (combatant.hasTalent(TALENTS.ANGELS_MERCY_TALENT) ? 20 : 0),
        gcd: null,
      },
      {
        spell: SPELLS.LEAP_OF_FAITH.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90 - (combatant.hasTalent(TALENTS.MOVE_WITH_GRACE_TALENT) ? 30 : 0),
        gcd: null,
        enabled: combatant.hasTalent(TALENTS.LEAP_OF_FAITH_TALENT),
      },
      {
        spell: SPELLS.FADE.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 30 - combatant.getTalentRank(TALENTS.IMPROVED_FADE_TALENT) * 5,
        gcd: null,
      },
      {
        spell: SPELLS.POWER_WORD_FORTITUDE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LEVITATE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIND_SOOTHE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.MASS_DISPEL_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.DISPEL_MAGIC_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIND_CONTROL.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHACKLE_UNDEAD.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PSYCHIC_SCREAM.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60 - (combatant.hasTalent(TALENTS.PSYCHIC_VOICE_TALENT) ? 15 : 0),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.PSYCHIC_HORROR_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.PSYCHIC_HORROR_TALENT),
      },
      {
        spell: SPELLS.MIND_VISION.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.PURIFY_DISEASE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.ANGELIC_FEATHER_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20,
        charges: 3,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHADOWFORM.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RESURRECTION.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;

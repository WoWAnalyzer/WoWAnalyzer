import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';
import calculateMaxCasts from 'Parser/Core/calculateMaxCasts';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.VOID_BOLT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 4.5 / (1 + haste),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          maxCasts: (cooldown, fightDuration, getAbility, parser) => {
            return calculateMaxCasts(cooldown, parser.modules.combatants.selected.getBuffUptime(SPELLS.VOIDFORM_BUFF.id));
          },
        },
      },
      {
        spell: SPELLS.MIND_BLAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste, combatant) => ((combatant.hasBuff(SPELLS.VOIDFORM_BUFF.id) ? 6 : 9) / (1 + haste)),
        enabled: !combatant.hasWaist(ITEMS.MANGAZAS_MADNESS.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.55,
        },
      },
      {
        spell: SPELLS.MIND_BLAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste, combatant) => ((combatant.hasBuff(SPELLS.VOIDFORM_BUFF.id) ? 6 : 9) / (1 + haste)),
        enabled: combatant.hasWaist(ITEMS.MANGAZAS_MADNESS.id),
        charges: 2,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },
      {
        spell: SPELLS.MIND_FLAY,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.SHADOW_WORD_DEATH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 9,
        charges: 2,
      },
      {
        spell: SPELLS.SHADOW_WORD_VOID_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 20,
        enabled: combatant.hasTalent(SPELLS.SHADOW_WORD_VOID_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.SHADOW_WORD_PAIN,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.VAMPIRIC_TOUCH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.VOID_ERUPTION,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },

      // Cooldowns
      {
        spell: SPELLS.VOID_TORRENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.75,
        },
      },
      {
        spell: SPELLS.MINDBENDER_TALENT_SHADOW,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        enabled: combatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.SHADOWFIEND,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: !combatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.POWER_INFUSION_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.POWER_INFUSION_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.SHADOW_CRASH_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 20,
        enabled: combatant.hasTalent(SPELLS.SHADOW_CRASH_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.SURRENDER_TO_MADNESS_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 600,
        enabled: combatant.hasTalent(SPELLS.SURRENDER_TO_MADNESS_TALENT.id),
      },

      // Utility
      {
        spell: SPELLS.DISPERSION,
        isDefensive: true,
        buffSpellId: SPELLS.DISPERSION.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: (haste, selectedCombatant) => 90 - (10 * selectedCombatant.traitsBySpellId[SPELLS.FROM_THE_SHADOWS_TRAIT.id]),
      },
      {
        spell: SPELLS.SILENCE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
      },
      {
        spell: SPELLS.MIND_BOMB_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.MIND_BOMB_TALENT.id),
      },
      {
        spell: SPELLS.VAMPIRIC_EMBRACE,
        buffSpellId: SPELLS.VAMPIRIC_EMBRACE.id,
        isDefensive: true,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 180,
      },
      {
        spell: SPELLS.POWER_WORD_SHIELD,
        isDefensive: true,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: haste => 7.5 / (1 + haste),
      },
      {
        spell: SPELLS.SHADOW_MEND,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      {
        spell: SPELLS.FADE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
      },
      {
        spell: SPELLS.ARCANE_TORRENT_MANA,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
        isUndetectable: true,
        castEfficiency: {
          suggestion: true,
        },
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
        spell: SPELLS.MIND_CONTROL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: (haste, selectedCombatant) => (selectedCombatant.hasTalent(SPELLS.DOMINANT_MIND_TALENT.id) ? 120 : 0),
      },
      {
        spell: SPELLS.SHACKLE_UNDEAD,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      {
        spell: SPELLS.PSYCHIC_SCREAM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: (haste, selectedCombatant) => 60 - (selectedCombatant.hasTalent(SPELLS.PSYCHIC_VOICE_TALENT.id) ? 30 : 0),
        enabled: !combatant.hasTalent(SPELLS.MIND_BOMB_TALENT.id),
      },
      {
        spell: SPELLS.MIND_VISION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      {
        spell: SPELLS.PURIFY_DISEASE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
      },
      {
        spell: SPELLS.SHADOWFORM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
    ];
  }
}

export default Abilities;

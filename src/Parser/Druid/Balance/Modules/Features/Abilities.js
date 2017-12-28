import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

/* eslint-disable no-unused-vars */

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilities.ABILITIES,
    // Rotational Spells
    {
      spell: SPELLS.NEW_MOON,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => {
        const availableCasts = combatant.owner.modules.newmoon.nmAvailableCasts;
        return (combatant.owner.fightDuration / 1000) / availableCasts;
      },
      noSuggestion: true,
    },
    {
      spell: SPELLS.HALF_MOON,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => {
        const availableCasts = combatant.owner.modules.halfmoon.hmAvailableCasts;
        return (combatant.owner.fightDuration / 1000) / availableCasts;
      },
      noSuggestion: true,
    },
    {
      spell: SPELLS.FULL_MOON,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => {
        const availableCasts = combatant.owner.modules.fullmoon.fmAvailableCasts;
        return (combatant.owner.fightDuration / 1000) / availableCasts;
      },
      noSuggestion: true,
    },
    {
      spell: SPELLS.MOONFIRE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.SUNFIRE_CAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => {
        const hasIFE = combatant.hasFinger(ITEMS.IMPECCABLE_FEL_ESSENCE.id);
        return hasIFE ? 105 : 180;
      },
      isActive: combatant => combatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id),
      noSuggestion: true,

    },
    {
      spell: SPELLS.CELESTIAL_ALIGNMENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => {
        const hasIFE = combatant.hasFinger(ITEMS.IMPECCABLE_FEL_ESSENCE.id);
        return hasIFE ? 105 : 180;
      },
      isActive: combatant => !combatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id),
      noSuggestion: true,
    },
    {
      spell: SPELLS.WARRIOR_OF_ELUNE_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => {
        return 50;
      },
      isActive: combatant => combatant.hasTalent(SPELLS.WARRIOR_OF_ELUNE_TALENT.id),
      recommendedEfficiency: 0.9,
      noSuggestion: true,
    },
    {
      spell: SPELLS.FORCE_OF_NATURE_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => {
        return 60;
      },
      isActive: combatant => combatant.hasTalent(SPELLS.FORCE_OF_NATURE_TALENT.id),
      recommendedEfficiency: 0.9,
      noSuggestion: true,
    },
  ];
}

export default Abilities;

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

/* eslint-disable no-unused-vars */

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    // Rotational Spells
    {
      spell: SPELLS.NEW_MOON,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => {
        const availableCasts = combatant.owner.modules.newmoon.nmAvailableCasts;
        return (combatant.owner.fightDuration / 1000) / availableCasts;
      },
      noSuggestion: true,
    },
    {
      spell: SPELLS.HALF_MOON,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => {
        const availableCasts = combatant.owner.modules.halfmoon.hmAvailableCasts;
        return (combatant.owner.fightDuration / 1000) / availableCasts;
      },
      noSuggestion: true,
    },
    {
      spell: SPELLS.FULL_MOON,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => {
        const availableCasts = combatant.owner.modules.fullmoon.fmAvailableCasts;
        return (combatant.owner.fightDuration / 1000) / availableCasts;
      },
      noSuggestion: true,
    },
    {
      spell: SPELLS.MOONFIRE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.SUNFIRE_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => {
        const hasIFE = combatant.hasFinger(ITEMS.IMPECCABLE_FEL_ESSENCE.id);
        return hasIFE ? 105 : 180;
      },
      isActive: combatant => combatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id),
      noSuggestion: true,

    },
    {
      spell: SPELLS.CELESTIAL_ALIGNMENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => {
        const hasIFE = combatant.hasFinger(ITEMS.IMPECCABLE_FEL_ESSENCE.id);
        return hasIFE ? 105 : 180;
      },
      isActive: combatant => !combatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id),
      noSuggestion: true,
    },
  ];
}

export default CastEfficiency;

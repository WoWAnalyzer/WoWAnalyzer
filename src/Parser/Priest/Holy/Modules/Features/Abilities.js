import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

/* eslint-disable no-unused-vars */

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilities.ABILITIES,
    // HW:Sanc and HW:Serenity not included due to Serendipity causing an odd situation with their CDs
    {
      spell: SPELLS.PRAYER_OF_MENDING_CAST,
      name: 'Prayer of Mending',
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => ((12 - (combatant.hasTalent(SPELLS.PIETY_TALENT.id) ? 2 : 0)) + 1.5) / (1 + haste), // +1.5 for base cast time
    },
    {
      spell: SPELLS.LIGHT_OF_TUURE_TRAIT,
      name: 'Light of T\'uure',
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 45,
      charges: 2,
      noSuggestion: true,
    },
    {
      spell: SPELLS.DESPERATE_PRAYER,
      name: 'Desperate Prayer',
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 90, // note: this number will be slightest under-represented due to our trait causing DP resets from damage
      noSuggestion: true,
    },
    {
      spell: SPELLS.APOTHEOSIS_TALENT,
      name: 'Apotheosis',
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => combatant.hasTalent(SPELLS.APOTHEOSIS_TALENT.id),
    },
    {
      spell: SPELLS.DIVINE_HYMN_CAST,
      name: 'Divine Hymn',
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
    },
    {
      spell: SPELLS.DIVINE_STAR_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 15,
      isActive: combatant => combatant.hasTalent(SPELLS.DIVINE_STAR_TALENT.id),
    },
    {
      spell: SPELLS.HALO_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 40,
      isActive: combatant => combatant.hasTalent(SPELLS.HALO_TALENT.id),
    },
    {
      spell: SPELLS.CIRCLE_OF_HEALING_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 15 / (1 + haste),
      isActive: combatant => combatant.hasTalent(SPELLS.CIRCLE_OF_HEALING_TALENT.id),
    },

    // Global CPM abilities
    {
      spell: SPELLS.ARCANE_TORRENT_MANA,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      isUndetectable: true,
    },
  ];
}

export default Abilities;

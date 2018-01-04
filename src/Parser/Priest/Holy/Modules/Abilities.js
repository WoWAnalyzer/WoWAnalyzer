import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() { // TODO: Migrate
    const combatant = this.combatants.selected;
    return [
      // HW:Sanc and HW:Serenity not included due to Serendipity causing an odd situation with their CDs
      {
        spell: SPELLS.PRAYER_OF_MENDING_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste, combatant) => ((12 - (combatant.hasTalent(SPELLS.PIETY_TALENT.id) ? 2 : 0)) + 1.5) / (1 + haste), // +1.5 for base cast time
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.LIGHT_OF_TUURE_TRAIT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 45,
        charges: 2,
      },
      {
        spell: SPELLS.DESPERATE_PRAYER,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 90, // note: this number will be slightest under-represented due to our trait causing DP resets from damage
      },
      {
        spell: SPELLS.APOTHEOSIS_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.hasTalent(SPELLS.APOTHEOSIS_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.DIVINE_HYMN_CAST,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
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
        spell: SPELLS.CIRCLE_OF_HEALING_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 15 / (1 + haste),
        enabled: combatant.hasTalent(SPELLS.CIRCLE_OF_HEALING_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },

      // Global CPM abilities
      {
        spell: SPELLS.ARCANE_TORRENT_MANA,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        isUndetectable: true,
        castEfficiency: {
          suggestion: true,
        },
      },
    ];
  }
}

export default Abilities;

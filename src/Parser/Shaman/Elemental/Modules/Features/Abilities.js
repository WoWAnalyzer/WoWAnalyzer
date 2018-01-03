import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  static SPELL_CATEGORIES = {
    ...CoreAbilities.SPELL_CATEGORIES,
    DOTS: 'Dot',
  };
  spellbook() { // TODO: Migrate
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.LAVA_BURST,
        charges: 2,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        // haste => 8 / (1 + haste)
        // TODO: Add Cooldown with stacks and Lava Surge procs
      },
      {
        spell: SPELLS.LIGHTNING_BOLT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.LIQUID_MAGMA_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        enabled: combatant.hasTalent(SPELLS.LIQUID_MAGMA_TOTEM_TALENT.id),
      },
      {
        spell: SPELLS.CHAIN_LIGHTNING,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE, // 2 / (1 + haste)
      },
      {
        spell: SPELLS.LAVA_BEAM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      },
      {
        spell: SPELLS.EARTHQUAKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      },
      {
        spell: SPELLS.ELEMENTAL_BLAST_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id),
        cooldown: 12,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
        },
      },
      {
        spell: SPELLS.ASCENDANCE_TALENT_ELEMENTAL,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1.0,
        },
      },
      {
        spell: SPELLS.STORMKEEPER,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.FIRE_ELEMENTAL,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60 * 5, // TODO: Add Elementalist -> Lava Burst cast ^= -2 sec cd
        enabled: !combatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1.0,
        },
      },
      {
        spell: SPELLS.STORM_ELEMENTAL_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60 * 2.5, // TODO: Add Elementalist -> Lava Burst cast ^= -2 sec cd
        enabled: combatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1.0,
        },
      },
      {
        spell: SPELLS.FLAME_SHOCK,
        category: Abilities.SPELL_CATEGORIES.DOTS,
      },
      {
        spell: SPELLS.FROST_SHOCK,
        category: Abilities.SPELL_CATEGORIES.DOTS,
      },
    ];
  }
}

export default Abilities;

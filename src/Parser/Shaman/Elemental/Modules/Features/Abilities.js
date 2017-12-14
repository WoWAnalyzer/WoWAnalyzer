import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

/* eslint-disable no-unused-vars */

class Abilities extends CoreAbilities {
  static SPELL_CATEGORIES = {
    ...CoreAbilities.SPELL_CATEGORIES,
    DOTS: 'Dot',
  };
  static ABILITIES = [
    ...CoreAbilities.ABILITIES,
    {
      spell: SPELLS.LAVA_BURST,
      charges: 2,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, // haste => 8 / (1 + haste)
      // TODO: Add Cooldown with stacks and Lava Surge procs
    },
    {
      spell: SPELLS.LIGHTNING_BOLT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.LIQUID_MAGMA_TOTEM_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      isActive: combatant => combatant.hasTalent(SPELLS.LIQUID_MAGMA_TOTEM_TALENT.id),
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.CHAIN_LIGHTNING,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null, // 2 / (1 + haste)
    },
    {
      spell: SPELLS.LAVA_BEAM,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.EARTHQUAKE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.ELEMENTAL_BLAST_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      isActive: combatant => combatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id),
      getCooldown: haste => 12,
      recommendedEfficiency: 0.6,
    },
    {
      spell: SPELLS.ASCENDANCE_TALENT_ELEMENTAL,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id),
      recommendedEfficiency: 1.0,
    },
    {
      spell: SPELLS.STORMKEEPER,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
    },
    {
      spell: SPELLS.FIRE_ELEMENTAL,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60 * 5, // TODO: Add Elementalist -> Lava Burst cast ^= -2 sec cd
      recommendedEfficiency: 1.0,
      isActive: combatant => !combatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id),
    },
    {
      spell: SPELLS.STORM_ELEMENTAL_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60 * 2.5, // TODO: Add Elementalist -> Lava Burst cast ^= -2 sec cd
      recommendedEfficiency: 1.0,
      isActive: combatant => combatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id),
    },
    {
      spell: SPELLS.FLAME_SHOCK,
      category: Abilities.SPELL_CATEGORIES.DOTS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.FROST_SHOCK,
      category: Abilities.SPELL_CATEGORIES.DOTS,
      getCooldown: haste => null,
    },
  ];
}

export default Abilities;
